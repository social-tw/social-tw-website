import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { commentService } from '../src/services/CommentService'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { CommentStatus } from '../src/types/Comment'
import { Post } from '../src/types/Post'
import { ReportCategory, ReportHistory, ReportType } from '../src/types/Report'
import { deployContracts, startServer, stopServer } from './environment'
import { UserStateFactory } from './utils/UserStateFactory'
import { comment } from './utils/comment'
import { post } from './utils/post'
import { signUp } from './utils/signUp'

describe('POST /api/report/create', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let chainId: number
    let db: any
    let nonce: number = 0

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
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
            type: ReportType.Post,
            objectId: '0',
            reportorEpochKey: 'epochKey1',
            reason: 'Inappropriate content',
            category: ReportCategory.Spam,
            reportEpoch: 1,
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })

        await express
            .post('/api/report/create')
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
            type: ReportType.Comment,
            objectId: '0',
            reportorEpochKey: 'epochKey1',
            reason: 'Spam',
            category: ReportCategory.Spam,
            reportEpoch: 1,
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })

        // Invalidate the proof
        epochKeyProof.publicSignals[0] = BigInt(0)

        await express
            .post('/api/report/create')
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
            type: ReportType.Comment,
            objectId: '0',
            reportorEpochKey: 'epochKey1',
            reason: 'Spam',
            category: ReportCategory.Spam,
            reportEpoch: 1,
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })

        await express
            .post('/api/report/create')
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
            type: ReportType.Post,
            objectId: '0',
            reportorEpochKey: 'epochKey1',
            reason: 'Inappropriate content',
            category: ReportCategory.Spam,
            reportEpoch: 1,
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })

        await express
            .post('/api/report/create')
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

    it('should fail to create a report with non-existent post/comment', async function () {
        const reportData: ReportHistory = {
            type: ReportType.Post,
            objectId: 'non-existent',
            reportorEpochKey: 'epochKey1',
            reason: 'Non-existent post',
            category: ReportCategory.Spam,
            reportEpoch: 1,
        }
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce,
        })

        await express
            .post('/api/report/create')
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
})
