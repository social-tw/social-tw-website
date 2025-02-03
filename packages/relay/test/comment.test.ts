import { UnirepApp } from '@unirep-app/contracts/typechain-types'
import { stringifyBigInts } from '@unirep/utils'
import { DB } from 'anondb'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { io } from 'socket.io-client'
import { APP_ABI as abi } from '../src/config'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import IpfsHelper from '../src/services/utils/IpfsHelper'
import { Post, PostStatus } from '../src/types'
import { HTTP_SERVER } from './configs'
import { deployContracts, startServer, stopServer } from './environment'
import { genReputationProof } from './utils/genProof'
import { post } from './utils/post'
import { signUp } from './utils/signup'
import { IdentityObject } from './utils/types'
import { createRandomUserIdentity, genUserState } from './utils/userHelper'

describe('COMMENT /comment', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let user: IdentityObject
    let chainId: number
    let testContent: String
    let commentEpoch: bigint
    let app: UnirepApp
    let prover: any
    let provider: any
    let db: DB
    let sync: UnirepSocialSynchronizer

    const EPOCH_LENGTH = 100000

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app: _app } = await deployContracts(EPOCH_LENGTH)
        // start server
        const {
            db: _db,
            prover: _prover,
            provider: _provider,
            synchronizer,
            chaiServer,
        } = await startServer(unirep, _app)
        express = chaiServer
        app = _app
        db = _db
        prover = _prover
        provider = _provider
        sync = synchronizer
        chainId = await unirep.chainid()

        user = createRandomUserIdentity()
        const userState = await signUp(user, {
            app,
            db,
            prover,
            provider,
            sync,
        })

        const txHash = await post(express, userState)
        await provider.waitForTransaction(txHash)
        await sync.waitForSync()

        const res = await express.get('/api/post/0')
        expect(res).to.have.status(200)
        const curPost = res.body as Post
        expect(curPost.status).to.equal(PostStatus.ON_CHAIN)
    })

    after(async function () {
        await stopServer('comment', snapshot, sync, express)
    })

    it('should create a comment', async function () {
        const userState = await genUserState(user.id, app, prover)
        testContent = 'create comment'
        const { createHelia } = await eval("import('helia')")
        const helia = await createHelia()
        const testContentHash = await IpfsHelper.createIpfsContent(
            helia,
            'create comment'
        )

        const repProof = await userState.genProveReputationProof({})
        commentEpoch = repProof.epoch

        // set up socket listener
        const clientSocket = io(HTTP_SERVER)
        clientSocket.on('comment', (...args) => {
            const [comment] = args
            expect(comment.postId).equal('0')
            expect(comment.content).equal(testContent)
            expect(comment.epochKey).equal(repProof.epochKey)
            expect(comment.epoch).equal(repProof.epoch)
            clientSocket.close()
        })

        // create a comment
        const txHash = await express
            .post('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    content: testContent,
                    postId: 0,
                    publicSignals: repProof.publicSignals,
                    proof: repProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body.txHash
            })

        // to check if the event emitting on chain correctly
        // Post Comment = {
        //  type in solidity        type in typescript
        //  uint256 epochKey, [0]   BigInt
        //  uint256 postId,   [1]   BigInt
        //  uint256 commentId [2]   BigInt
        //  uint256 epoch     [3]   BigInt
        //  string cid        [4]   String
        // }
        const epk = repProof.epochKey as bigint
        const receipt = await provider.waitForTransaction(txHash)
        const unirepAppInterface = new ethers.utils.Interface(abi)
        const rawEvent = receipt.logs
            .map((log) => unirepAppInterface.parseLog(log))
            .find((log) => log.name == 'Comment')
        const commentEvent = rawEvent?.args

        expect(commentEvent).to.not.be.undefined
        if (commentEvent) {
            expect(commentEvent[0].toString()).equal(epk.toString())
            expect(commentEvent[1]).equal('0')
            expect(commentEvent[2]).equal('0')
            expect(commentEvent[3]).equal('0')
            expect(commentEvent[4]).equal(testContentHash)
        }

        await sync.waitForSync()

        // comment on the post
        await express.get(`/api/comment?postId=0`).then((res) => {
            expect(res).to.have.status(200)
            const comments = res.body
            expect(comments[0].transactionHash).equal(txHash)
            expect(comments[0].content).equal(testContent)
            expect(comments[0].status).equal(1)
        })
    })

    it('should get correct records from CommentHistory', async function () {
        const res = await express.get(
            '/api/comment/commentHistory?from_epoch=0&to_epoch=5'
        )
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array').that.has.lengthOf(1)
    })

    it('should comment failed with wrong proof', async function () {
        const userState = await genUserState(user.id, app, prover)
        testContent = 'comment with wrong proof'
        const repProof = await userState.genProveReputationProof({})

        repProof.publicSignals[0] = BigInt(0)

        await express
            .post('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    content: testContent,
                    postId: 0,
                    publicSignals: repProof.publicSignals,
                    proof: repProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid reputation proof')
            })
    })

    it('should comment failed with wrong epoch', async function () {
        const userState = await genUserState(user.id, app, prover)
        testContent = 'comment with wrong epoch'
        // generating a proof with wrong epoch
        const wrongEpoch = 44444
        const attesterId = sync.attesterId
        const epoch = await userState.latestTransitionedEpoch(attesterId)
        const tree = await sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const id = userState.id
        const data = await userState.getProvableData()
        const repProof = await genReputationProof({
            id,
            tree,
            leafIndex,
            epoch: wrongEpoch,
            nonce: 0,
            chainId,
            attesterId,
            data,
        })

        await express
            .post('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    content: testContent,
                    postId: 0,
                    publicSignals: repProof.publicSignals,
                    proof: repProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid epoch')
            })
    })

    it('delete the comment failed with wrong proof', async function () {
        const userState = await genUserState(user.id, app, prover)
        const reputationProof = await userState.genProveReputationProof({
            epkNonce: 1,
        })

        // invalidate the proof
        reputationProof.publicSignals[1] = BigInt(0)

        // delete a comment
        await express
            .delete('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    commentId: 0,
                    postId: 0,
                    publicSignals: reputationProof.publicSignals,
                    proof: reputationProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid reputation proof')
            })
    })

    it('delete the comment failed with wrong epoch key', async function () {
        const userState = await genUserState(user.id, app, prover)
        const reputationProof = await userState.genProveReputationProof({
            epkNonce: 2,
        })

        // delete a comment
        await express
            .delete('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    commentId: 0,
                    postId: 0,
                    publicSignals: reputationProof.publicSignals,
                    proof: reputationProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid epoch key')
            })
    })

    it('delete the comment success', async function () {
        const userState = await genUserState(user.id, app, prover)
        const attesterId = sync.attesterId
        const epoch = Number(commentEpoch)
        const tree = await sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const id = userState.id
        const data = await userState.getProvableData()
        const reputationProof = await genReputationProof({
            id,
            tree,
            leafIndex,
            epoch,
            nonce: 0,
            chainId,
            attesterId,
            data,
        })

        // delete a comment
        const txHash = await express
            .delete('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    commentId: 0,
                    postId: 0,
                    publicSignals: reputationProof.publicSignals,
                    proof: reputationProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body.txHash
            })

        await provider.waitForTransaction(txHash)
        await sync.waitForSync()

        // check comment exist
        await express.get(`/api/comment?postId=0`).then((res) => {
            expect(res).to.have.status(200)
            const comments = res.body
            expect(comments.length).equal(0)
        })
    })

    it('should revert with invalid epoch range', async function () {
        const res = await express.get(
            '/api/comment/commentHistory?from_epoch=2&to_epoch=1'
        )
        expect(res).to.have.status(400)
        expect(res.body.error).to.equal('Invalid epoch range')
    })

    it('should return 404 when no comments found in the given epoch range', async function () {
        const res = await express.get(
            '/api/comment/commentHistory?from_epoch=100&to_epoch=101'
        )
        expect(res).to.have.status(404)
        expect(res.body.error).to.equal(
            'No comment history found for the given epoch range'
        )
    })
})
