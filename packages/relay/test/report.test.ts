import { Unirep, UnirepApp } from '@unirep-app/contracts/typechain-types'
import { stringifyBigInts } from '@unirep/utils'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { commentService } from '../src/services/CommentService'
import { reportService } from '../src/services/ReportService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import {
    AdjudicateValue,
    CommentStatus,
    Post,
    PostStatus,
    ReportCategory,
    ReportHistory,
    ReportStatus,
    ReportType,
} from '../src/types'
import { deployContracts, startServer, stopServer } from './environment'
import { comment } from './utils/comment'
import { genAuthentication } from './utils/genAuthentication'
import { genReportNullifier } from './utils/genNullifier'
import { genReportIdentityProof, userStateTransition } from './utils/genProof'
import { post } from './utils/post'
import { signUp } from './utils/signup'
import { resetReportResult } from './utils/sqlHelper'
import { IdentityObject } from './utils/types'
import { createUserIdentities, genUserState } from './utils/userHelper'

describe('POST /api/report', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let sync: UnirepSocialSynchronizer
    let unirep: Unirep
    let db: DB
    let nonce: number = 0
    let chainId: number
    const EPOCH_LENGTH = 100000
    let users: IdentityObject[]
    let app: UnirepApp
    let prover: any
    let provider: any

    let epochKeyLitePublicSignals: string
    let epochKeyLiteProof: string

    before(async function () {
        this.timeout(600000)
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep: _unirep, app: _app } = await deployContracts(
            EPOCH_LENGTH
        )
        // start server
        const {
            db: _db,
            prover: _prover,
            provider: _provider,
            synchronizer,
            chaiServer,
        } = await startServer(_unirep, _app)
        db = _db
        express = chaiServer
        sync = synchronizer
        unirep = _unirep
        app = _app
        prover = _prover
        provider = _provider

        users = createUserIdentities(3)
        const userState = await signUp(users[0], {
            app,
            db,
            prover,
            provider,
            sync,
        })

        // signup in another block to prevent timeout
        {
            await signUp(users[1], {
                app,
                db,
                prover,
                provider,
                sync,
            })
            await signUp(users[2], {
                app,
                db,
                prover,
                provider,
                sync,
            })
        }

        chainId = await unirep.chainid()

        const authentication = await genAuthentication(userState)

        {
            await post(express, userState, authentication, nonce).then(
                async (txHash) => {
                    await provider.waitForTransaction(txHash)
                    await sync.waitForSync()
                    nonce++
                }
            )

            await express.get('/api/post/0').then((res) => {
                expect(res).to.have.status(200)
                const curPost = res.body as Post
                expect(curPost.status).to.equal(1)
            })
        }

        {
            await comment(express, userState, authentication, '0', nonce).then(
                async (res) => {
                    await provider.waitForTransaction(res.txHash)
                    await sync.waitForSync()
                    nonce++
                }
            )

            const resComment = await commentService.fetchSingleComment(
                '0',
                db,
                CommentStatus.ON_CHAIN
            )
            expect(resComment).to.be.exist
        }
    })

    after(async function () {
        await stopServer('report', snapshot, sync, express)
    })

    it('should create a report and update post status', async function () {
        const postId = '0'
        const userState = await genUserState(users[0].id, app, prover)
        const reportData: ReportHistory = {
            type: ReportType.POST,
            objectId: postId,
            reportorEpochKey: 'epochKey1',
            reason: 'Inappropriate content',
            category: ReportCategory.SPAM,
            reportEpoch: sync.calcCurrentEpoch(),
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })
        const authentication = await genAuthentication(userState)

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    _reportData: reportData,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )
            .then(async (res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('reportId')
            })

        // Verify that the post status is updated and content is filtered
        const afterReportResponse = await express.get(
            `/api/post/${postId}?status=${PostStatus.REPORTED}`
        )
        expect(afterReportResponse).to.have.status(200)
        expect(afterReportResponse.body).to.not.have.property('content')
        expect(afterReportResponse.body).to.have.property(
            'status',
            PostStatus.REPORTED
        )

        // Verify that other properties are still present
        expect(afterReportResponse.body).to.have.property('postId')
        expect(afterReportResponse.body).to.have.property('publishedAt')
        expect(afterReportResponse.body).to.have.property('epochKey')
        // Verify that the post is still accessible but filtered when fetching all posts
        const allPostsResponse = await express.get('/api/post')
        expect(allPostsResponse).to.have.status(200)
        const reportedPost = allPostsResponse.body.find(
            (post) => post.postId === postId
        )
        expect(reportedPost).to.exist
        expect(reportedPost).to.not.have.property('content')
        expect(reportedPost).to.have.property('status', PostStatus.REPORTED)
    })

    it('should fail to create a report with invalid proof', async function () {
        const userState = await genUserState(users[0].id, app, prover)
        const reportData: ReportHistory = {
            type: ReportType.COMMENT,
            objectId: '0',
            reportorEpochKey: 'epochKey1',
            reason: 'Spam',
            category: ReportCategory.SPAM,
            reportEpoch: sync.calcCurrentEpoch(),
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })

        // Invalidate the proof
        epochKeyProof.publicSignals[0] = BigInt(0)

        const authentication = await genAuthentication(userState)

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    _reportData: reportData,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid proof')
            })
    })

    it('should create a report and update comment status', async function () {
        const commentId = '0'
        const userState = await genUserState(users[0].id, app, prover)
        const reportData: ReportHistory = {
            type: ReportType.COMMENT,
            objectId: commentId,
            reportorEpochKey: 'epochKey1',
            reason: 'Spam',
            category: ReportCategory.SPAM,
            reportEpoch: sync.calcCurrentEpoch(),
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })

        const authentication = await genAuthentication(userState)

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    _reportData: reportData,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('reportId')
            })

        // Verify that the comment status is updated and content is filtered
        const afterReportComment = await commentService.fetchSingleComment(
            commentId,
            db,
            CommentStatus.REPORTED
        )
        expect(afterReportComment).to.exist
        expect(afterReportComment).to.not.have.property('content')
        expect(afterReportComment).to.have.property(
            'status',
            CommentStatus.REPORTED
        )

        // Verify that other properties are still present
        expect(afterReportComment).to.have.property('commentId')
        expect(afterReportComment).to.have.property('publishedAt')
        expect(afterReportComment).to.have.property('epochKey')
        // Add checks for other expected properties

        // Optionally, verify that the comment is still accessible but filtered when fetching all comments for a post
        const allCommentsResponse = await express.get(
            `/api/comment?postId=${afterReportComment?.postId}`
        )
        expect(allCommentsResponse).to.have.status(200)
        const reportedComment = allCommentsResponse.body.find(
            (comment) => comment.commentId === commentId
        )
        expect(reportedComment).to.exist
        expect(reportedComment).to.not.have.property('content')
        expect(reportedComment).to.have.property(
            'status',
            CommentStatus.REPORTED
        )
    })

    it('should fail to create a report on the same post / comment', async function () {
        const userState = await genUserState(users[0].id, app, prover)
        const reportData: ReportHistory = {
            type: ReportType.POST,
            objectId: '0',
            reportorEpochKey: 'epochKey1',
            reason: 'Inappropriate content',
            category: ReportCategory.SPAM,
            reportEpoch: sync.calcCurrentEpoch(),
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })

        const authentication = await genAuthentication(userState)

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    _reportData: reportData,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Post has been reported')
            })
    })

    it('should fail to create a report with non-existent post/comment', async function () {
        const userState = await genUserState(users[0].id, app, prover)
        const reportData: ReportHistory = {
            type: ReportType.POST,
            objectId: 'non-existent',
            reportorEpochKey: 'epochKey1',
            reason: 'Non-existent post',
            category: ReportCategory.SPAM,
            reportEpoch: sync.calcCurrentEpoch(),
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })

        const authentication = await genAuthentication(userState)

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    _reportData: reportData,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid postId')
            })
    })

    it('should get empty report list if reportEpoech is equal to currentEpoch', async function () {
        const userState = await genUserState(users[0].id, app, prover)
        const { publicSignals, proof } = await userState.genEpochKeyLiteProof({
            nonce,
        })

        epochKeyLitePublicSignals = JSON.stringify(
            stringifyBigInts(publicSignals)
        )
        epochKeyLiteProof = JSON.stringify(stringifyBigInts(proof))

        await express
            .get(
                `/api/report?status=${ReportStatus.VOTING}&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).equal(0)
            })
    })

    it('should fetch report whose reportEpoch is equal to currentEpoch - 1', async function () {
        // epoch transition
        await provider.send('evm_increaseTime', [EPOCH_LENGTH])
        await provider.send('evm_mine', [])

        const reports = await express
            .get(
                `/api/report?status=0&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body
            })

        const currentEpoch = await sync.loadCurrentEpoch()
        const epochDiff = currentEpoch - reports[0].reportEpoch
        // report on post and comment, so the result would be 2
        expect(reports.length).equal(2)
        expect(epochDiff).equal(1)
        for (let i = 0; i < reports.length; i++) {
            const report = reports[0]
            const tableName =
                report.reportType == ReportType.POST ? 'Post' : 'Comment'
            const object = await db.findOne(tableName, {
                where: {
                    [`${tableName.toLocaleLowerCase()}Id`]: report.objectId,
                },
            })
            expect(report.object.content).to.be.equal(object.content)
        }
    })

    it('should fail to fetch report with wrong query status or without status query params', async function () {
        const wrongStatus = 6
        await express
            .get(
                `/api/report?status=${wrongStatus}&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid report status')
            })

        await express.get('/api/report').then((res) => {
            expect(res).to.have.status(400)
            expect(res.body.error).to.be.equal('Invalid report status')
        })
    })

    it('should fail with invalid public signals or proof', async function () {
        await express
            .get(
                `/api/report?status=${ReportStatus.VOTING}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid public signal')
            })

        await express
            .get(
                `/api/report?status=${ReportStatus.VOTING}&publicSignals=${epochKeyLitePublicSignals}`
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid proof')
            })

        const wrongProof = JSON.parse(epochKeyLiteProof)
        wrongProof[0] = '0'

        await express
            .get(
                `/api/report?status=${
                    ReportStatus.VOTING
                }&publicSignals=${epochKeyLitePublicSignals}&proof=${JSON.stringify(
                    wrongProof
                )}`
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid proof')
            })
    })

    it('should not fetch report whose adjudication count has reached threshold', async function () {
        // update mock value into report
        const adjudicatorsNullifier = [
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
        ]
        await db.update('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.POST }],
            },
            update: {
                adjudicatorsNullifier,
                adjudicateCount: adjudicatorsNullifier.length,
            },
        })

        const votingReports = await express
            .get(
                `/api/report?status=${ReportStatus.VOTING}&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body
            })

        // filter out the report whose objectId is '0' and type is POST
        const filteredReports = votingReports.filter(
            (report: any) =>
                report.objectId !== '0' && report.type === ReportType.POST
        )

        expect(filteredReports.length).equal(0)

        const waitingForTxReports = await express
            .get(
                `/api/report?status=${ReportStatus.WAITING_FOR_TRANSACTION}&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => res.body)

        // no report is waiting for transaction
        // because the report is still in voting status
        // and since the adjudication count has reached threshold
        // so when querying voting reports, it will be filtered out
        expect(waitingForTxReports.length).equal(0)
    })

    it('should fetch report whose adjudication count is less than 5', async function () {
        // epoch transition
        await provider.send('evm_increaseTime', [EPOCH_LENGTH])
        await provider.send('evm_mine', [])
        // nobody vote on reports[1], it can be fetched on next epoch
        const reports = await express
            .get(
                `/api/report?status=${ReportStatus.VOTING}&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body
            })

        expect(reports[0].adjudicateCount).lt(5)
        expect(reports[0].status).equal(0)
        const currentEpoch = await sync.loadCurrentEpoch()
        const epochDiff = currentEpoch - reports[0].reportEpoch
        expect(epochDiff).gt(1)
    })

    it('should fetch report whose status is waiting for transaction', async function () {
        // insert mock value into report
        const adjudicatorsNullifier = [
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
        ]
        await db.update('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.POST }],
            },
            update: {
                adjudicatorsNullifier,
                adjudicateCount: adjudicatorsNullifier.length,
                status: ReportStatus.WAITING_FOR_TRANSACTION,
            },
        })

        const reports = await express
            .get(
                `/api/report?status=${ReportStatus.WAITING_FOR_TRANSACTION}&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body
            })

        expect(reports[0].adjudicateCount).gte(5)
        expect(reports[0].status).equal(1)
        const currentEpoch = await sync.loadCurrentEpoch()
        const epochDiff = currentEpoch - reports[0].reportEpoch
        expect(epochDiff).gt(1)
    })

    it('should vote agree on the report', async function () {
        const userState = await genUserState(users[0].id, app, prover)
        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })

        const nullifier = genReportNullifier(users[0].id, report.reportId)

        const toEpoch = await userStateTransition(userState, {
            express,
            unirep,
        })
        const { proof, publicSignals } = await genReportIdentityProof(
            userState,
            {
                nullifier,
                chainId,
                toEpoch,
                reportId: report.reportId,
            }
        )

        const authentication = await genAuthentication(userState)

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    adjudicateValue: AdjudicateValue.AGREE,
                    publicSignals,
                    proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(201)
            })

        await reportService
            .fetchSingleReport(report.reportId, db)
            .then((res) => {
                expect(res?.status).equal(ReportStatus.VOTING)
                expect(res?.adjudicateCount).equal(1)
                const adjudicator = res?.adjudicatorsNullifier![0]!
                expect(adjudicator.adjudicateValue).equal(AdjudicateValue.AGREE)
                expect(adjudicator.nullifier).equal(publicSignals[0])
            })

        await resetReportResult(db, report)
    })

    it('should vote disagree on the report', async function () {
        const userState = await genUserState(users[1].id, app, prover)
        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })

        const nullifier = genReportNullifier(users[1].id, report.reportId)

        const toEpoch = await userStateTransition(userState, {
            express,
            unirep,
        })
        const { proof, publicSignals } = await genReportIdentityProof(
            userState,
            {
                nullifier,
                chainId,
                toEpoch,
                reportId: report.reportId,
            }
        )

        const authentication = await genAuthentication(userState)

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    adjudicateValue: AdjudicateValue.DISAGREE,
                    publicSignals,
                    proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(201)
            })

        await reportService
            .fetchSingleReport(report.reportId, db)
            .then((res) => {
                expect(res?.status).equal(ReportStatus.VOTING)
                expect(res?.adjudicateCount).equal(2)
                const adjudicator = res?.adjudicatorsNullifier![1]!
                expect(adjudicator.adjudicateValue).equal(
                    AdjudicateValue.DISAGREE
                )
                expect(adjudicator.nullifier).to.be.equal(publicSignals[0])
            })

        await resetReportResult(db, report)
    })

    it('should fail if report identity proof is wrong', async function () {
        const userState = await genUserState(users[2].id, app, prover)
        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })

        const nullifier = genReportNullifier(users[2].id, report.reportId)
        const toEpoch = await userStateTransition(userState, {
            express,
            unirep,
        })

        const { proof, publicSignals } = await genReportIdentityProof(
            userState,
            {
                nullifier,
                chainId,
                toEpoch,
                reportId: report.reportId,
            }
        )

        publicSignals[0] = '0'

        const authentication = await genAuthentication(userState)

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    adjudicateValue: AdjudicateValue.AGREE,
                    publicSignals,
                    proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid proof')
            })
    })

    it('should fail if report does not exist', async function () {
        const userState = await genUserState(users[2].id, app, prover)
        const notExistReportId = '444'
        const nullifier = genReportNullifier(users[2].id, notExistReportId)
        const toEpoch = await userStateTransition(userState, {
            express,
            unirep,
        })

        const { proof, publicSignals } = await genReportIdentityProof(
            userState,
            {
                nullifier,
                chainId,
                toEpoch,
                reportId: notExistReportId,
            }
        )

        const authentication = await genAuthentication(userState)

        await express
            .post(`/api/report/${notExistReportId}`)
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    adjudicateValue: AdjudicateValue.AGREE,
                    publicSignals,
                    proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Report does not exist')
            })
    })

    it('should fail if vote invalid adjudicate value', async function () {
        const userState = await genUserState(users[2].id, app, prover)
        const wrongAdjucateValue = 'wrong'

        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })

        const nullifier = genReportNullifier(users[2].id, report.reportId)
        const toEpoch = await userStateTransition(userState, {
            express,
            unirep,
        })

        const { proof, publicSignals } = await genReportIdentityProof(
            userState,
            {
                nullifier,
                chainId,
                toEpoch,
                reportId: report.reportId,
            }
        )

        const authentication = await genAuthentication(userState)

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    adjudicateValue: wrongAdjucateValue,
                    publicSignals,
                    proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid adjudicate value')
            })
    })

    it('should fail if vote on the report with same nullifier', async function () {
        const userState = await genUserState(users[0].id, app, prover)
        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })
        const nullifier = genReportNullifier(users[0].id, report.reportId)
        const toEpoch = await userStateTransition(userState, {
            express,
            unirep,
        })

        const { proof, publicSignals } = await genReportIdentityProof(
            userState,
            {
                nullifier,
                chainId,
                toEpoch,
                reportId: report.reportId,
            }
        )

        const authentication = await genAuthentication(userState)

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    adjudicateValue: AdjudicateValue.AGREE,
                    publicSignals,
                    proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('User has already voted')
            })
    })

    it('should fail if vote on the report whose status is not VOTING', async function () {
        const userState = await genUserState(users[2].id, app, prover)
        const watingForTxReport = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.POST }],
            },
        })

        const nullifier = genReportNullifier(
            users[2].id,
            watingForTxReport.reportId
        )
        const toEpoch = await userStateTransition(userState, {
            express,
            unirep,
        })

        const { proof, publicSignals } = await genReportIdentityProof(
            userState,
            {
                nullifier,
                chainId,
                toEpoch,
                reportId: watingForTxReport.reportId,
            }
        )

        const authentication = await genAuthentication(userState)

        await express
            .post(`/api/report/${watingForTxReport.reportId}`)
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    adjudicateValue: AdjudicateValue.AGREE,
                    publicSignals,
                    proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Report voting has ended')
            })

        // mock this report to be completed
        await db.update('ReportHistory', {
            where: {
                reportId: watingForTxReport.reportId,
            },
            update: {
                reportorClaimedRep: true,
                respondentClaimedRep: true,
                status: ReportStatus.COMPLETED,
            },
        })

        await express
            .post(`/api/report/${watingForTxReport.reportId}`)
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    adjudicateValue: AdjudicateValue.AGREE,
                    publicSignals,
                    proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Report voting has ended')
            })
    })

    it('should settle report and update object status', async function () {
        // insert mock value into report
        const adjudicatorsNullifier = [
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
        ]
        const prevEpoch = await sync.loadCurrentEpoch()
        await db.update('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.POST }],
            },
            update: {
                adjudicatorsNullifier,
                adjudicateCount: adjudicatorsNullifier.length,
                status: ReportStatus.VOTING,
                reportEpoch: prevEpoch,
            },
        })
        // epoch transition
        await provider.send('evm_increaseTime', [EPOCH_LENGTH])
        await provider.send('evm_mine', [])
        const curEpoch = await sync.loadCurrentEpoch()
        expect(curEpoch).equal(prevEpoch + 1)
        await unirep.updateEpochIfNeeded(sync.attesterId).then((t) => t.wait())
        await sync.waitForSync()

        const report = await express
            .get(
                `/api/report?status=${ReportStatus.WAITING_FOR_TRANSACTION}&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(200)
                const reports = res.body
                expect(reports.length).to.be.equal(1)
                expect(reports[0].status).to.be.equal(
                    ReportStatus.WAITING_FOR_TRANSACTION
                )
                return reports[0]
            })

        await express.get(`/api/post/${report.objectId}`).then((res) => {
            const curPost = res.body as Post
            expect(curPost.status).to.equal(PostStatus.DISAGREED)
            expect(curPost).to.not.have.property('content')
        })
    })

    it('should not settle report if the vote count is less than five', async function () {
        // insert mock value into report
        const adjudicatorsNullifier = [
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
        ]
        const prevEpoch = await sync.loadCurrentEpoch()
        await db.update('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.POST }],
            },
            update: {
                adjudicatorsNullifier,
                adjudicateCount: adjudicatorsNullifier.length,
                status: ReportStatus.VOTING,
                reportEpoch: prevEpoch,
            },
        })
        await db.update('Post', {
            where: {
                postId: '0',
            },
            update: {
                status: PostStatus.REPORTED,
            },
        })
        // epoch transition
        await provider.send('evm_increaseTime', [EPOCH_LENGTH])
        await provider.send('evm_mine', [])
        const curEpoch = await sync.loadCurrentEpoch()
        expect(curEpoch).equal(prevEpoch + 1)
        await unirep.updateEpochIfNeeded(sync.attesterId).then((t) => t.wait())
        await sync.waitForSync()

        const report = await express
            .get(
                `/api/report?status=${ReportStatus.VOTING}&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(200)
                const reports = res.body
                expect(reports.length).to.be.equal(2)
                return reports
            })

        await express.get(`/api/post/${report[0].objectId}`).then((res) => {
            expect(res).to.have.status(200)
            const curPost = res.body as Post
            expect(curPost.status).to.equal(PostStatus.REPORTED)
        })
    })

    it('should not settle report if the vote is tie', async function () {
        // insert mock value into report
        const adjudicatorsNullifier = [
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.AGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
            { adjudicateValue: AdjudicateValue.DISAGREE },
        ]
        const prevEpoch = await sync.loadCurrentEpoch()
        await db.update('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.POST }],
            },
            update: {
                adjudicatorsNullifier,
                adjudicateCount: adjudicatorsNullifier.length,
                status: ReportStatus.VOTING,
                reportEpoch: prevEpoch,
            },
        })
        // epoch transition
        await provider.send('evm_increaseTime', [EPOCH_LENGTH])
        await provider.send('evm_mine', [])
        const curEpoch = await sync.loadCurrentEpoch()
        expect(curEpoch).equal(prevEpoch + 1)
        await unirep.updateEpochIfNeeded(sync.attesterId).then((t) => t.wait())
        await sync.waitForSync()

        const report = await express
            .get(
                `/api/report?status=${ReportStatus.VOTING}&publicSignals=${epochKeyLitePublicSignals}&proof=${epochKeyLiteProof}`
            )
            .then((res) => {
                expect(res).to.have.status(200)
                const reports = res.body
                expect(reports.length).to.be.equal(2)
                return reports
            })

        await express.get(`/api/post/${report[0].objectId}`).then((res) => {
            expect(res).to.have.status(200)
            const curPost = res.body as Post
            expect(curPost.status).to.equal(PostStatus.REPORTED)
        })
    })

    it('should fetch report category', async function () {
        const reportCategories = await express
            .get('/api/report/category')
            .then((res) => res.body)
        expect(reportCategories.length).equal(
            Object.keys(ReportCategory).filter((category) =>
                isNaN(Number(category))
            ).length
        )
        expect(reportCategories[0].number).equal(ReportCategory.ATTACK)
        expect(reportCategories[0].description).to.be.equal(
            '對使用者、特定個人、組織或群體發表中傷、歧視、挑釁、羞辱、謾罵、不雅字詞或人身攻擊等言論'
        )
        expect(reportCategories[1].number).equal(ReportCategory.SPAM)
        expect(reportCategories[1].description).to.be.equal(
            '張貼商業廣告內容與連結、邀請碼或內含個人代碼的邀請連結等'
        )
        expect(reportCategories[2].number).equal(ReportCategory.R18)
        expect(reportCategories[2].description).to.be.equal(
            '張貼色情裸露、性暗示意味濃厚的內容，惟內容具教育性者不在此限'
        )
        expect(reportCategories[3].number).equal(ReportCategory.VIOLATION)
        expect(reportCategories[3].description).to.be.equal(
            '違反政府法令之情事'
        )
        expect(reportCategories[4].number).equal(ReportCategory.DUPLICATE)
        expect(reportCategories[4].description).to.be.equal(
            '重複張貼他人已發表過且完全相同的內容'
        )
        expect(reportCategories[5].number).equal(ReportCategory.MEANINGLESS)
        expect(reportCategories[5].description).to.be.equal(
            '文章內容空泛或明顯無意義內容'
        )
        expect(reportCategories[6].number).equal(ReportCategory.OTHER)
        expect(reportCategories[6].description).to.be.equal('其他')
    })
})
