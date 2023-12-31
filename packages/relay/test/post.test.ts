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
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { UserStateFactory } from './utils/UserStateFactory'
import { genEpochKeyProof, randomData } from './utils/genProof'
import { signUp } from './utils/signUp'
import { SQLiteConnector } from 'anondb/node'
import { postData } from './mocks/posts'
import { PostService } from '../src/services/PostService'
import { insertComments, insertPosts, insertVotes } from './utils/sqlHelper'

const { STATE_TREE_DEPTH } = CircuitConfig.default

describe('POST /post', function () {
    let snapshot: any
    let express: Server
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let sqlite: SQLiteConnector
    let pService: PostService
    let chainId: number

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(1000)
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

        chainId = await unirep.chainid()
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
            chainId,
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
            nonce: 0,
            chainId,
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
        // insert 9 mock posts into db
        const mockPosts = postData
        mockPosts.unshift(
            await sqlite.findOne('Post', { where: { postId: '0' } })
        )
        await insertPosts(sqlite)
        // insert random amount of comments into db
        await insertComments(sqlite)
        // insert random amount of votes into db
        await insertVotes(sqlite)

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

        for (let i = 0; i < posts.length - 1; i++) {
            // postId 0 ~ 4: published <= 2 days
            // postId 5 ~ 9: published > 2 days
            if (i == 4) {
                continue
            }

            const prevPost: any = posts[i]
            const nextPost: any = posts[i + 1]
            if (i < 5) {
                // 1. sorting score prevPost >= nextPost
                // 2. sorting score eq, publishedAt prevPost >= nextPost
                expect(prevPost.sorting_score).gte(nextPost.sorting_score)
                if (prevPost.sorting_score == nextPost.sorting_score) {
                    expect(BigInt(prevPost.publishedAt)).gte(
                        BigInt(nextPost.publishedAt)
                    )
                }
            } else {
                // 1. sorting score prevPost >= nextPost
                // 2. sorting score eq, daily_upvotes prevPost >= nextPost
                // 3. daily_upvotes eq, daily_comments prevPost >= nextPost
                // 4. daily_comments eq, publishedAt prevPost > nextPost
                expect(prevPost.sorting_score).gte(nextPost.sorting_score)
                if (prevPost.sorting_score == nextPost.sorting_score) {
                    expect(prevPost.daily_upvotes).gte(nextPost.daily_upvotes)

                    if (prevPost.daily_upvotes == nextPost.daily_upvotes) {
                        expect(prevPost.daily_comments).gte(
                            nextPost.daily_comments
                        )

                        if (
                            prevPost.daily_comments == nextPost.daily_comments
                        ) {
                            expect(BigInt(prevPost.publishedAt)).gte(
                                BigInt(nextPost.publishedAt)
                            )
                        }
                    }
                }
            }
        }
    })
})
