import fetch from 'node-fetch'
import { ethers } from 'hardhat'
import { expect } from 'chai'

import { CircuitConfig } from '@unirep/circuits'
import { UserState } from '@unirep/core'
import {
    stringifyBigInts,
    IncrementalMerkleTree,
    genStateTreeLeaf,
} from '@unirep/utils'

import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'

import { Server } from 'http'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/synchornizer'
import { UserStateFactory } from './utils/UserStateFactory'
import { genEpochKeyProof, randomData } from './utils/genProof'
import { signUp } from './utils/signUp'
import { post } from './utils/post'
import { Post } from '../src/types/Post'
import { io } from 'socket.io-client'

const { STATE_TREE_DEPTH } = CircuitConfig.default

describe('COMMENT /comment', function () {
    let snapshot: any
    let express: Server
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let chainId: number

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(1000)
        // start server
        const { db, prover, provider, synchronizer, server } =
            await startServer(unirep, app)
        express = server
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

        const result = await post(userState)
        await ethers.provider.waitForTransaction(result.transaction)
        await sync.waitForSync()

        await fetch(`${HTTP_SERVER}/api/post/0`).then(async (r) => {
            expect(r.status).equal(200)
            const post = (await r.json()) as Post
            expect(post.status).equal(1)
        })

        chainId = await unirep.chainid()
    })

    after(async function () {
        await ethers.provider.send('evm_revert', [snapshot])
        userState.stop()
        express.close()
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
        const result: any = await fetch(`${HTTP_SERVER}/api/comment`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content: testContent,
                    postId: 0,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        await ethers.provider.waitForTransaction(result.transaction)
        await sync.waitForSync()

        // comment on the post
        let comments: any = await fetch(
            `${HTTP_SERVER}/api/comment?epks=${epochKeyProof.epochKey}&postId=0`
        ).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })
        expect(comments[0].transactionHash).equal(result.transaction)
        expect(comments[0].content).equal(testContent)
        expect(comments[0].status).equal(1)
    })

    it('should comment failed with wrong proof', async function () {
        const testContent = 'test content'

        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 2,
        })

        epochKeyProof.publicSignals[0] = BigInt(0)

        const res: any = await fetch(`${HTTP_SERVER}/api/comment`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content: testContent,
                    postId: 0,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal('Invalid proof')
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

        const res: any = await fetch(`${HTTP_SERVER}/api/comment`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content: testContent,
                    postId: 0,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal('Invalid Epoch')
    })

    it('should comment failed with wrong state tree', async function () {
        const testContent = 'invalid state tree'

        // generating a proof with wrong epoch
        const attesterId = await userState.sync.attesterId
        const epoch = await userState.latestTransitionedEpoch(attesterId)
        const tree = new IncrementalMerkleTree(STATE_TREE_DEPTH)
        const data = randomData()
        const id = userState.id
        const leaf = genStateTreeLeaf(
            id.secret,
            attesterId,
            epoch,
            data,
            chainId
        )
        tree.insert(leaf)
        const epochKeyProof = await genEpochKeyProof({
            id,
            tree,
            leafIndex: 0,
            epoch,
            nonce: 2,
            chainId,
            attesterId,
            data,
        })

        const res: any = await fetch(`${HTTP_SERVER}/api/comment`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content: testContent,
                    postId: 0,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal('Invalid State Tree')
    })

    it('delete the comment failed with wrong proof', async function () {
        let epochKeyProof = await userState.genEpochKeyLiteProof({
            nonce: 0,
        })

        epochKeyProof.publicSignals[0] = BigInt(0)

        // create a comment
        const result: any = await fetch(`${HTTP_SERVER}/api/comment`, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    commentId: 0,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(result.error).equal('Invalid proof')
    })

    it('delete the comment failed with wrong epoch', async function () {
        const wrongEpoch = 44444
        let epochKeyProof = await userState.genEpochKeyLiteProof({
            nonce: 0,
            epoch: wrongEpoch,
        })

        // create a comment
        const result: any = await fetch(`${HTTP_SERVER}/api/comment`, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    commentId: 0,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(result.error).equal('Invalid Epoch')
    })

    it('delete the comment success', async function () {
        let epochKeyProof = await userState.genEpochKeyLiteProof({
            nonce: 1,
        })

        // create a comment
        const result: any = await fetch(`${HTTP_SERVER}/api/comment`, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    commentId: 0,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        await ethers.provider.waitForTransaction(result.transaction)
        await sync.waitForSync()

        // check comment exist
        let comments: any = await fetch(
            `${HTTP_SERVER}/api/comment?postId=0`
        ).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        expect(comments.length).equal(0)
    })
})
