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
import { VoteAction } from '../src/types'
import { Post } from '../src/types/Post'
import { PostService } from '../src/services/PostService'

const { STATE_TREE_DEPTH } = CircuitConfig.default

describe('POST /post', function () {
    let snapshot: any
    let express: Server
    let userState: UserState
    let sync: UnirepSocialSynchronizer

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
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
        var initUser = await userService.getLoginUser(db, '123', undefined)
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
    })

    after(async function () {
        await ethers.provider.send('evm_revert', [snapshot])
        sync.stop()
        express.close()
    })

    it('should create a post', async function () {
        // FIXME: Look for fuzzer to test content
        const testContent = 'test content #0'

        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        const res: any = await fetch(`${HTTP_SERVER}/api/post`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content: testContent,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                })
            ),
        }).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        await ethers.provider.waitForTransaction(res.transaction)
        await sync.waitForSync()

        var posts: any = await fetch(`${HTTP_SERVER}/api/post`).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        expect(posts[0].transactionHash).equal(res.transaction)
        expect(posts[0].content).equal(testContent)
        expect(posts[0].status).equal(1)

        const mockEpk = epochKeyProof.epochKey + BigInt(1)

        posts = await fetch(
            `${HTTP_SERVER}/api/post?query=mocktype&epks=${mockEpk}`
        ).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        expect(posts.length).equal(0)
    })

    it('should post failed with wrong proof', async function () {
        const testContent = 'test content'

        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        epochKeyProof.publicSignals[0] = BigInt(0)

        const res: any = await fetch(`${HTTP_SERVER}/api/post`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content: testContent,
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

    it('should post failed with wrong epoch', async function () {
        const testContent = 'invalid epoch'

        // generating a proof with wrong epoch
        const wrongEpoch = 44444
        const attesterId = userState.sync.attesterId
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
            nonce: 0,
            attesterId,
            data,
        })

        const res: any = await fetch(`${HTTP_SERVER}/api/post`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content: testContent,
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

    it('should post failed with wrong state tree', async function () {
        const testContent = 'invalid state tree'

        // generating a proof with wrong epoch
        const attesterId = userState.sync.attesterId
        const epoch = await userState.latestTransitionedEpoch(attesterId)
        const tree = new IncrementalMerkleTree(STATE_TREE_DEPTH)
        const data = randomData()
        const id = userState.id
        const leaf = genStateTreeLeaf(id.secret, attesterId, epoch, data)
        tree.insert(leaf)
        const epochKeyProof = await genEpochKeyProof({
            id,
            tree,
            leafIndex: 0,
            epoch,
            nonce: 0,
            attesterId,
            data,
        })

        const res: any = await fetch(`${HTTP_SERVER}/api/post`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    content: testContent,
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

    it('should update post order periodcally', async function (done) {
        // add 9 posts
        for (let i = 1; i <= 9; i++) {
            const testContent = `test content #${i}`
            const epochKeyProof = await userState.genEpochKeyProof({
                nonce: 0,
            })

            const res: any = await fetch(`${HTTP_SERVER}/api/post`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(
                    stringifyBigInts({
                        content: testContent,
                        publicSignals: epochKeyProof.publicSignals,
                        proof: epochKeyProof.proof,
                    })
                ),
            }).then((r) => r.json())

            await ethers.provider.waitForTransaction(res.transaction)
        }
        await sync.waitForSync()

        let posts: any = await fetch(`${HTTP_SERVER}/api/post?offset=0`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
        }).then((res) => res.json())

        console.log('Before Sorting:', posts.map((post) => post.postId))

        // add upvote to posts ramdonly
        for (let i = 1; i <= 10; i++) {
            const epochKeyProof = await userState.genEpochKeyProof({
                nonce: 0,
            })

            const idx = Math.floor((Math.random() * 100) % 10)

            await fetch(`${HTTP_SERVER}/api/vote`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(
                    stringifyBigInts({
                        _id: posts[idx]._id,
                        voteAction: VoteAction.UPVOTE,
                        publicSignals: epochKeyProof.publicSignals,
                        proof: epochKeyProof.proof,
                    })
                ),
            })
        }

        // add downvote to posts randomly
        for (let i = 1; i <= 10; i++) {
            const epochKeyProof = await userState.genEpochKeyProof({
                nonce: 0,
            })

            const idx = Math.floor((Math.random() * 100) % 10)

            await fetch(`${HTTP_SERVER}/api/vote`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(
                    stringifyBigInts({
                        _id: posts[idx]._id,
                        voteAction: VoteAction.DOWNVOTE,
                        publicSignals: epochKeyProof.publicSignals,
                        proof: epochKeyProof.proof,
                    })
                ),
            })
        }

        // add comment to posts randomly
        for (let i = 1; i <= 10; i++) {
            const testContent = `test comment #${i}`
            const epochKeyProof = await userState.genEpochKeyProof({
                nonce: 0,
            })

            const postId = Math.floor((Math.random() * 100) % 10)

            const res: any = await fetch(`${HTTP_SERVER}/api/comment`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(
                    stringifyBigInts({
                        content: testContent,
                        postId: postId,
                        publicSignals: epochKeyProof.publicSignals,
                        proof: epochKeyProof.proof,
                    })
                ),
            }).then((r) => r.json())

            await ethers.provider.waitForTransaction(res.transaction)
        }
        await sync.waitForSync()

        setTimeout(function(){
            console.log('waiting over.');
            done();
        }, 10000)

        posts = await fetch(`${HTTP_SERVER}/api/post?offset=0`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
        }).then((res) => res.json())

        console.log('After Sorting:', posts.map((post) => post.postId))
    })
})
