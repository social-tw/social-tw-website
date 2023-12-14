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
import { SQLiteConnector } from 'anondb/node'
import { data } from './mocks/posts'
import { PostService } from '../src/services/PostService'
import { Post } from '../src/types/Post'

const { STATE_TREE_DEPTH } = CircuitConfig.default

describe('POST /post', function () {
    let snapshot: any
    let express: Server
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let sqlite: SQLiteConnector
    let pService: PostService

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
        // start server
        const { db, prover, provider, synchronizer, server, postService } =
            await startServer(unirep, app)
        express = server
        sync = synchronizer
        sqlite = db as SQLiteConnector
        pService = postService

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

        let posts: any = await fetch(
            `${HTTP_SERVER}/api/post?query=mocktype&epks=${epochKeyProof.epochKey}`
        ).then((r) => {
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

    it('should update post order periodically', async function () {
        const getRandom = () => {
            return Math.floor(Math.random() * 1000)
        }

        const DAY_IN_MILLISECOND = 86400000
        const HOUR_IN_MILLISECOND = 3600000

        // insert 9 mock posts into
        const mockPosts = data
        mockPosts.unshift(
            await sqlite.findOne('Post', { where: { postId: '0' } })
        )
        for (let i = 0; i < mockPosts.length; i++) {
            const mockPost = mockPosts[i]
            // make first 5 posts are posted within 2 days
            if (i > 0 && i < 5) {
                mockPost.publishedAt = (
                    +new Date() -
                    DAY_IN_MILLISECOND -
                    HOUR_IN_MILLISECOND * i
                ).toString()
            } else {
                mockPost.publishedAt = (
                    +new Date() -
                    DAY_IN_MILLISECOND * 3 -
                    HOUR_IN_MILLISECOND * i
                ).toString()
            }
            // let commentCount, upCount, downCount of each post
            // have value range from 0 ~ 999
            mockPost.commentCount = getRandom()
            mockPost.upCount = getRandom()
            mockPost.downCount = getRandom()

            await sqlite.upsert('Post', {
                where: { postId: mockPost.postId },
                create: {
                    ...mockPost,
                },
                update: {
                    upCount: mockPost.upCount,
                    downCount: mockPost.downCount,
                    commentCount: mockPost.commentCount,
                },
                constraintKey: 'transactionHash',
            })
        }

        await pService.updateOrder(sqlite)

        const posts: [] = await fetch(`${HTTP_SERVER}/api/post?page=1`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
        }).then(async (res) => {
            expect(res.status).equal(200)
            const data: any = await res.json()
            return data as []
        })

        for (let i = 0; i < posts.length; i++) {
            const post: any = posts[i]
            if (i < 5) {
                // posts less than 2 days will be grouped on filter 1
                expect(post.FILTER).equal(1)
            } else {
                expect(post.FILTER).equal(2)
            }
            // post with higher score will have smaller number
            expect(post.OD).equal((i % 5) + 1)
        }
    })
})
