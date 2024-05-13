import { expect } from 'chai'
import { ethers } from 'hardhat'
import { io } from 'socket.io-client'
import { CircuitConfig } from '@unirep/circuits'
import { UserState } from '@unirep/core'
import {
    genStateTreeLeaf,
    IncrementalMerkleTree,
    stringifyBigInts,
} from '@unirep/utils'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { UserStateFactory } from './utils/UserStateFactory'
import { Post } from '../src/types/Post'
import { HTTP_SERVER } from './configs'
import { deployContracts, startServer, stopServer } from './environment'
import { genEpochKeyProof, randomData } from './utils/genProof'
import { post } from './utils/post'
import { signUp } from './utils/signUp'

const { STATE_TREE_DEPTH } = CircuitConfig.default

describe('COMMENT /comment', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let chainId: number

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
        // start server
        const { db, prover, provider, synchronizer, chaiServer } =
            await startServer(unirep, app)
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

        const result = await post(chaiServer, userState)
        await ethers.provider.waitForTransaction(result.transaction)
        await sync.waitForSync()

        const res = await chaiServer.get('/api/post/0')
        expect(res).to.have.status(200)
        const curPost = res.body as Post
        expect(curPost.status).to.equal(1)

        chainId = await unirep.chainid()
    })

    after(async function () {
        await stopServer('comment', snapshot, sync, express)
    })

    it('should create a comment', async function () {
        // TODO: Look for fuzzer to test content
        const testContent = 'test content'
        let epochKeyProof = await userState.genEpochKeyProof({
            nonce: 1,
        })

        // set up socket listener
        const clientSocket = io(HTTP_SERVER)
        clientSocket.on('comment', (...args) => {
            const [comment] = args
            expect(comment.postId).equal('0')
            expect(comment.content).equal(testContent)
            expect(comment.epochKey).equal(epochKeyProof.epochKey)
            expect(comment.epoch).equal(epochKeyProof.epoch)
            clientSocket.close()
        })

        // create a comment
        const transaction = await express
            .post('/api/comment')
            .set('content-type', 'application/json')
            .send({
                content: testContent,
                postId: 0,
                publicSignals: stringifyBigInts(epochKeyProof.publicSignals),
                proof: stringifyBigInts(epochKeyProof.proof),
            })
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body.transaction
            })

        await ethers.provider.waitForTransaction(transaction)
        await sync.waitForSync()

        // comment on the post
        await express
            .get(`/api/comment?epks=${epochKeyProof.epochKey}&postId=0`)
            .then((res) => {
                expect(res).to.have.status(200)
                const comments = res.body
                expect(comments[0].transactionHash).equal(transaction)
                expect(comments[0].content).equal(testContent)
                expect(comments[0].status).equal(1)
            })
    })

    it('should comment failed with wrong proof', async function () {
        const testContent = 'test content'

        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 2,
        })

        epochKeyProof.publicSignals[0] = BigInt(0)

        await express
            .post('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    content: testContent,
                    postId: 0,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid proof')
            })
    })

    it('should comment failed with wrong epoch', async function () {
        const testContent = 'invalid epoch'

        // generating a proof with wrong epoch
        const wrongEpoch = 44444
        const attesterId = await userState.sync.attesterId
        const epoch = await userState.latestTransitionedEpoch(attesterId)
        const tree = await userState.sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId
        )
        const id = userState.id
        const data = randomData()
        const epochKeyProof = await genEpochKeyProof({
            id,
            tree,
            leafIndex,
            epoch: wrongEpoch,
            nonce: 2,
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
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid epoch')
            })
    })

    it('delete the comment failed with wrong proof', async function () {
        let epochKeyLiteProof = await userState.genEpochKeyLiteProof({
            nonce: 1,
        })

        // invalidate the proof
        epochKeyLiteProof.publicSignals[1] = BigInt(0)

        // delete a comment
        await express
            .delete('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    commentId: 0,
                    postId: 0,
                    publicSignals: epochKeyLiteProof.publicSignals,
                    proof: epochKeyLiteProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid proof')
            })
    })

    it('delete the comment failed with wrong epoch key', async function () {
        let epochKeyLiteProof = await userState.genEpochKeyLiteProof({
            nonce: 2,
        })

        // delete a comment
        await express
            .delete('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    commentId: 0,
                    postId: 0,
                    publicSignals: epochKeyLiteProof.publicSignals,
                    proof: epochKeyLiteProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid epoch key')
            })
    })

    it('delete the comment success', async function () {
        let epochKeyLiteProof = await userState.genEpochKeyLiteProof({
            nonce: 1,
        })

        // delete a comment
        const transaction = await express
            .delete('/api/comment')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    commentId: 0,
                    postId: 0,
                    publicSignals: epochKeyLiteProof.publicSignals,
                    proof: epochKeyLiteProof.proof,
                })
            )
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body.transaction
            })

        await ethers.provider.waitForTransaction(transaction)
        await sync.waitForSync()

        // check comment exist
        await express.get(`/api/comment?postId=0`).then((res) => {
            expect(res).to.have.status(200)
            const comments = res.body
            expect(comments.length).equal(0)
        })
    })
})
