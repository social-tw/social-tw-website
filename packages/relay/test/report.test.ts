import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { commentService } from '../src/services/CommentService'
import { reportService } from '../src/services/ReportService'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import {
    AdjudicateValue,
    CommentStatus,
    Post,
    ReportCategory,
    ReportHistory,
    ReportStatus,
    ReportType,
} from '../src/types'
import { deployContracts, startServer, stopServer } from './environment'
import { UserStateFactory } from './utils/UserStateFactory'
import { comment } from './utils/comment'
import { post } from './utils/post'
import { signUp } from './utils/signUp'

describe('POST /api/report', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let chainId: number
    let db: any
    let nonce: number = 0
    const EPOCH_LENGTH = 100000
    // TODO: need to update to real nullifier like poseidon(userId, reportId)
    const AGREE_NULLIFIER = 'agree'
    const DISAGREE_NULLIFIER = 'disagree'
    const WRONGE_ADJUCATE_VALUE = 'wrong'

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(EPOCH_LENGTH)
        // start server
        const {
            db: _db,
            prover,
            provider,
            synchronizer,
            chaiServer,
        } = await startServer(unirep, app)
        db = _db
        express = chaiServer
        sync = synchronizer
        const userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            app,
            synchronizer
        )

        // initUserStatus
        let initUser = await userService.getLoginUser(db, '123', undefined)
        const wallet = ethers.Wallet.createRandom()
        userState = await signUp(
            initUser,
            userStateFactory,
            userService,
            synchronizer,
            wallet
        )

        await userState.waitForSync()
        const hasSignedUp = await userState.hasSignedUp()

        expect(hasSignedUp).equal(true)

        await post(chaiServer, userState, nonce).then(async (res) => {
            await ethers.provider.waitForTransaction(res.txHash)
            await sync.waitForSync()
            nonce++
        })

        await chaiServer.get('/api/post/0').then((res) => {
            expect(res).to.have.status(200)
            const curPost = res.body as Post
            expect(curPost.status).to.equal(1)
        })

        await comment(chaiServer, userState, '0', nonce).then(async (res) => {
            await ethers.provider.waitForTransaction(res.txHash)
            await sync.waitForSync()
            nonce++
        })

        const resComment = await commentService.fetchSingleComment(
            '0',
            db,
            CommentStatus.OnChain
        )
        expect(resComment).to.be.exist

        chainId = await unirep.chainid()
    })

    after(async function () {
        await stopServer('report', snapshot, sync, express)
    })

    it('should create a report and update post status', async function () {
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

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
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

        // Verify that the post status is updated
        await express.get(`/api/post/0?status=2`).then((res) => {
            expect(res).to.have.status(200)
        })
    })

    it('should fail to create a report with invalid proof', async function () {
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

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
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

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
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

        // Verify that the comment status is updated
        const comment = await commentService.fetchSingleComment(
            '0',
            db,
            CommentStatus.Reported
        )
        expect(comment).to.be.exist
    })

    it('should fail to create a report on the same post / comment', async function () {
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

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
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

        await express
            .post('/api/report')
            .set('content-type', 'application/json')
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
        await express.get('/api/report?status=0').then((res) => {
            expect(res).to.have.status(200)
            expect(res.body.length).equal(0)
        })
    })

    it('should fetch report whose reportEpoch is equal to currentEpoch - 1', async function () {
        // epoch transition
        await ethers.provider.send('evm_increaseTime', [EPOCH_LENGTH])
        await ethers.provider.send('evm_mine', [])

        const reports = await express
            .get('/api/report?status=0')
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
        await express.get('/api/report?status=6').then((res) => {
            expect(res).to.have.status(400)
            expect(res.body.error).to.be.equal('Invalid report status')
        })

        await express.get('/api/report').then((res) => {
            expect(res).to.have.status(400)
            expect(res.body.error).to.be.equal('Invalid report status')
        })
    })

    it('should fetch report whose adjudication result is tie', async function () {
        // update mock value into report
        db.update('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.POST }],
            },
            update: {
                adjudicatorsNullifier: [
                    { adjudicateValue: 1 },
                    { adjudicateValue: 1 },
                    { adjudicateValue: 1 },
                    { adjudicateValue: 0 },
                    { adjudicateValue: 0 },
                    { adjudicateValue: 0 },
                ],
                adjudicateCount: 6,
            },
        })

        // epoch transition
        await ethers.provider.send('evm_increaseTime', [EPOCH_LENGTH])
        await ethers.provider.send('evm_mine', [])

        const reports = await express
            .get('/api/report?status=0')
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body
            })

        // flatMap to [adjudicateValue1, adjucateValue2 ...]
        // add all adjudicateValues (0: disagree, 1: agree)
        const adjudicateResult = reports[0].adjudicatorsNullifier
            .flatMap((nullifier) => nullifier.adjudicateValue)
            .reduce((acc, value) => {
                // disagree
                if (Number(value) == 0) {
                    return acc - 1
                }
                // agree
                return acc + 1
            })
        expect(adjudicateResult).equal(0)
        expect(reports[0].adjudicateCount).gt(5)
    })

    it('should fetch report whose adjudication count is less than 5', async function () {
        // nobody vote on reports[1], it can be fetched on next epoch
        const reports = await express
            .get('/api/report?status=0')
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body
            })

        expect(reports[1].adjudicateCount).lt(5)
        expect(reports[1].status).equal(0)
        const currentEpoch = await sync.loadCurrentEpoch()
        const epochDiff = currentEpoch - reports[1].reportEpoch
        expect(epochDiff).gt(1)
    })

    it('should fetch report whose status is waiting for transaction', async function () {
        // insert mock value into report
        db.update('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.POST }],
            },
            update: {
                adjudicatorsNullifier: [
                    { adjudicateValue: 1 },
                    { adjudicateValue: 1 },
                    { adjudicateValue: 1 },
                    { adjudicateValue: 1 },
                    { adjudicateValue: 0 },
                    { adjudicateValue: 0 },
                    { adjudicateValue: 0 },
                ],
                adjudicateCount: 7,
                status: ReportStatus.WAITING_FOR_TRANSACTION,
            },
        })

        const reports = await express
            .get('/api/report?status=1')
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body
            })

        expect(reports[0].adjudicateCount).gt(5)
        expect(reports[0].status).equal(1)
        const currentEpoch = await sync.loadCurrentEpoch()
        const epochDiff = currentEpoch - reports[0].reportEpoch
        expect(epochDiff).gt(1)
    })

    it('should vote agree on the report', async function () {
        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .send({
                nullifier: AGREE_NULLIFIER,
                adjudicateValue: AdjudicateValue.AGREE,
            })
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
                expect(adjudicator.nullifier).equal(AGREE_NULLIFIER)
            })
    })

    it('should vote disagree on the report', async function () {
        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .send({
                nullifier: DISAGREE_NULLIFIER,
                adjudicateValue: AdjudicateValue.DISAGREE,
            })
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
                expect(adjudicator.nullifier).to.be.equal(DISAGREE_NULLIFIER)
            })
    })

    it('should fail if report does not exist', async function () {
        const notExistReportId = 'NotExistReportId'
        await express
            .post(`/api/report/${notExistReportId}`)
            .set('content-type', 'application/json')
            .send({
                nullifier: AGREE_NULLIFIER,
                adjudicateValue: AdjudicateValue.AGREE,
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Report does not exist')
            })
    })

    it('should fail if vote invalid adjudicate value', async function () {
        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .send({
                nullifier: DISAGREE_NULLIFIER,
                adjudicateValue: WRONGE_ADJUCATE_VALUE,
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid adjudicate value')
            })
    })

    it('should fail if vote on the report without nullifier', async function () {
        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .send({
                adjudicateValue: AdjudicateValue.DISAGREE,
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Invalid report nullifier')
            })
    })

    it('should fail if vote on the report with same nullifier', async function () {
        const report = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.COMMENT }],
            },
        })

        await express
            .post(`/api/report/${report.reportId}`)
            .set('content-type', 'application/json')
            .send({
                nullifier: AGREE_NULLIFIER,
                adjudicateValue: AdjudicateValue.AGREE,
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('User has already voted')
            })
    })

    it('should fail if vote on the report whose status is not VOTING', async function () {
        const watingForTxReport = await db.findOne('ReportHistory', {
            where: {
                AND: [{ objectId: '0' }, { type: ReportType.POST }],
            },
        })

        await express
            .post(`/api/report/${watingForTxReport.reportId}`)
            .set('content-type', 'application/json')
            .send({
                nullifier: AGREE_NULLIFIER,
                adjudicateValue: AdjudicateValue.AGREE,
            })
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
            .send({
                nullifier: AGREE_NULLIFIER,
                adjudicateValue: AdjudicateValue.AGREE,
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).to.be.equal('Report voting has ended')
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
