import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { commentService } from '../src/services/CommentService'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import {
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
})
