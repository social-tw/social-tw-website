import { expect } from 'chai'
import { ethers } from 'hardhat'

import { UnirepApp } from '@unirep-app/contracts/typechain-types'
import { stringifyBigInts } from '@unirep/utils'
import { DB } from 'anondb'
import { APP_ABI as abi } from '../src/config'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import IpfsHelper from '../src/services/utils/IpfsHelper'
import { deployContracts, startServer, stopServer } from './environment'
import { postData } from './mocks/posts'
import { genAuthentication } from './utils/genAuthentication'
import { genEpochKeyProof, randomData } from './utils/genProof'
import { post } from './utils/post'
import { signUp } from './utils/signup'
import { insertComments, insertPosts, insertVotes } from './utils/sqlHelper'
import { IdentityObject } from './utils/types'
import { createRandomUserIdentity, genUserState } from './utils/userHelper'

describe('POST /post', function () {
    let snapshot: any
    let express: ChaiHttp.Agent
    let db: DB
    let chainId: number
    let authentication: string
    let user: IdentityObject
    let app: UnirepApp
    let prover: any
    let provider: any
    let sync: UnirepSocialSynchronizer

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app: _app } = await deployContracts(100000)
        // start server
        const {
            db: _db,
            prover: _prover,
            provider: _provider,
            synchronizer,
            chaiServer,
        } = await startServer(unirep, _app)
        express = chaiServer
        db = _db
        app = _app
        prover = _prover
        provider = _provider
        sync = synchronizer

        user = createRandomUserIdentity()
        const userState = await signUp(user, {
            app,
            db,
            prover,
            provider,
            sync,
        })

        chainId = await unirep.chainid()

        authentication = await genAuthentication(userState)
    })

    after(async function () {
        await stopServer('post', snapshot, sync, express)
    })

    it('should create a post', async function () {
        const userState = await genUserState(user.id, app, prover)
        // FIXME: Look for fuzzer to test content
        const testContent = 'test content #0'
        // cid of test content
        const { createHelia } = await eval("import('helia')")
        const helia = await createHelia()
        const testContentHash = await IpfsHelper.createIpfsContent(
            helia,
            testContent,
        )
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        const res = await express
            .post('/api/post')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    content: testContent,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                }),
            )
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body
            })

        // to check if the event emitting on chain correctly
        // Post Event = {
        //  type in solidity        type in typescript
        //  uint256 epochKey, [0]   BigInt
        //  uint256 postId,   [1]   BigInt
        //  uint256 epoch     [2]   BigInt
        //  string cid        [3]   String
        // }
        const epk = epochKeyProof.epochKey as bigint
        const receipt = await provider.waitForTransaction(res.txHash)
        const unirepAppInterface = new ethers.utils.Interface(abi)
        const rawEvent = receipt.logs
            .map((log) => unirepAppInterface.parseLog(log))
            .find((log) => log.name == 'Post')
        const postEvent = rawEvent?.args

        expect(postEvent).to.not.be.undefined
        if (postEvent) {
            expect(postEvent[0].toString()).equal(epk.toString())
            expect(postEvent[1]).equal('0')
            expect(postEvent[2]).equal('0')
            expect(postEvent[3]).equal(testContentHash)
        }

        await sync.waitForSync()

        let posts = await express
            .get(`/api/post?epks=${epochKeyProof.epochKey}`)
            .then((res) => {
                expect(res).to.have.status(200)
                return res.body
            })

        expect(posts[0].transactionHash).equal(res.txHash)
        expect(posts[0].content).equal(testContent)
        expect(posts[0].status).equal(1)
        // for checking cid is synchronized in db

        expect(posts[0].cid).equal(testContentHash)

        const mockEpk = epochKeyProof.epochKey + BigInt(1)

        posts = await express.get(`/api/post?epks=${mockEpk}`).then((res) => {
            expect(res).to.have.status(200)
            return res.body
        })

        expect(posts.length).equal(0)
    })

    it('should post failed with wrong proof', async function () {
        const userState = await genUserState(user.id, app, prover)
        const testContent = 'test content'

        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        epochKeyProof.publicSignals[0] = BigInt(0)

        await express
            .post('/api/post')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    content: testContent,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                }),
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid proof')
            })
    })

    it('should post failed with wrong epoch', async function () {
        const userState = await genUserState(user.id, app, prover)
        const testContent = 'invalid epoch'

        // generating a proof with wrong epoch
        const wrongEpoch = 44444
        const attesterId = sync.attesterId
        const epoch = await userState.latestTransitionedEpoch(attesterId)
        const tree = await sync.genStateTree(epoch, attesterId)
        const leafIndex = await userState.latestStateTreeLeafIndex(
            epoch,
            attesterId,
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

        await express
            .post('/api/post')
            .set('content-type', 'application/json')
            .set('authentication', authentication)
            .send(
                stringifyBigInts({
                    content: testContent,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                }),
            )
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res.body.error).equal('Invalid epoch')
            })
    })

    it('should update post order periodically', async function () {
        // insert 9 mock posts into db
        const mockPosts = postData
        mockPosts.unshift(await db.findOne('Post', { where: { postId: '0' } }))
        await insertPosts(db)
        // insert random amount of comments into db
        await insertComments(db)
        // insert random amount of votes into db
        await insertVotes(db)

        // since already fetch from db, no need to update order here
        const posts = await express.get(`/api/post?page=1`).then((res) => {
            expect(res).to.have.status(200)
            return res.body
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
                        BigInt(nextPost.publishedAt),
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
                            nextPost.daily_comments,
                        )

                        if (
                            prevPost.daily_comments == nextPost.daily_comments
                        ) {
                            expect(BigInt(prevPost.publishedAt)).gte(
                                BigInt(nextPost.publishedAt),
                            )
                        }
                    }
                }
            }
        }
    })

    it('should fetch posts which are already on-chain', async function () {
        const userState = await genUserState(user.id, app, prover)
        // send a post
        const txHash = await post(express, userState, authentication)
        // update the cache, the amount of posts is still 10
        // since the above post is not on-chain yet
        // one page will have 10 posts
        let posts = await express.get(`/api/post?page=1`).then((res) => {
            expect(res).to.have.status(200)
            return res.body
        })

        // every post is on-chain so the status must be 1
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i]
            expect(post.status).equal(1)
            expect(post.content).include('test content')
        }

        // second page will be empty
        posts = await express.get(`/api/post?page=2`).then((res) => {
            expect(res).to.have.status(200)
            return res.body
        })

        expect(posts.length).equal(0)

        // check the post is off-chain so the status must be 0
        const offChainPost = await db.findOne('Post', {
            where: {
                transactionHash: txHash,
            },
        })

        expect(offChainPost.status).equal(0)
    })

    it('should fetch posts by keyword', async function () {
        let posts = await express.get(`/api/post?q=content`).then((res) => {
            expect(res).to.have.status(200)
            return res.body
        })

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i]
            expect(post.status).equal(1)
            expect(post.content).include('test content')
        }
    })

    it('should fetch post failed with incorrect input', async function () {
        // page number shouldn't be negative
        await express.get(`/api/post?page=-1`).then((res) => {
            expect(res).to.have.status(400)
            expect(res.body.error).equal('Invalid page: page is undefined')
        })
        // page number shouldn't be non-integer
        await express.get(`/api/post?page=0.1`).then((res) => {
            expect(res).to.have.status(400)
            expect(res.body.error).equal('Invalid page: page is undefined')
        })
    })
    it('should get correct records from PostHistory', async function () {
        const res = await express.get(
            '/api/post/postHistory?from_epoch=0&to_epoch=5',
        )
        expect(res).to.have.status(200)
        expect(res.body).to.be.an('array').that.has.lengthOf(11)
    })

    it('should revert with invalid epoch range', async function () {
        const res = await express.get(
            '/api/post/postHistory?from_epoch=2&to_epoch=1',
        )
        expect(res).to.have.status(400)
        expect(res.body.error).to.equal('Invalid epoch range')
    })

    it('should return 404 when no posts found in the given epoch range', async function () {
        const res = await express.get(
            '/api/post/postHistory?from_epoch=100&to_epoch=101',
        )
        expect(res).to.have.status(404)
        expect(res.body.error).to.equal(
            'No post history found for the given epoch range',
        )
    })
})
