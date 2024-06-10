import { ethers } from 'hardhat'
import { expect } from 'chai'
import { DB } from 'anondb'

import { UserState } from '@unirep/core'
import { deployContracts, startServer, stopServer } from './environment'
import { stringifyBigInts } from '@unirep/utils'

import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/services/singletons/UnirepSocialSynchronizer'
import { UserStateFactory } from './utils/UserStateFactory'
import { signUp } from './utils/signUp'
import { post } from './utils/post'
import { VoteAction } from '../src/types'
import { genEpochKeyProof, randomData } from './utils/genProof'
import { PostService } from '../src/services/PostService'
import { io } from 'socket.io-client'
import { EventType, VoteMsg } from '../src/types/SocketTypes'

describe('POST /vote', function () {
    let socketClient: any
    let snapshot: any
    let anondb: DB
    let express: ChaiHttp.Agent
    let userStateFactory: UserStateFactory
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let upvotePostId: string
    let downvotePostId: string
    let otherPostId: string
    let pService: PostService
    let chainId: number

    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
        // start server
        const { db, prover, provider, chaiServer, synchronizer, postService } =
            await startServer(unirep, app)

        // start socket client
        socketClient = io('http://localhost:3000')

        anondb = db
        express = chaiServer
        sync = synchronizer
        pService = postService
        userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            app,
            synchronizer
        )

        const initUser = await userService.getLoginUser(db, '123', undefined)
        userState = await signUp(
            initUser,
            userStateFactory,
            userService,
            synchronizer
        )

        await userState.waitForSync()
        const hasSignedUp = await userState.hasSignedUp()
        expect(hasSignedUp).equal(true)

        // produce three posts
        const postPromises = [
            post(express, userState),
            post(express, userState),
            post(express, userState),
        ]

        const postResponses = await Promise.all(postPromises)
        await Promise.all(
            postResponses.map((res) =>
                ethers.provider.waitForTransaction(res.txHash)
            )
        )
        await sync.waitForSync()
        await pService.updateOrder(anondb)
        // get the post ids
        const posts = await express.get('/api/post?page=1').then((res) => {
            expect(res).to.have.status(200)
            expect(res.body.length).equal(3)
            return res.body
        })

        const upVotePost = posts[0]
        const downVotePost = posts[1]
        const otherPost = posts[2]
        expect(upVotePost.status).equal(1)
        expect(downVotePost.status).equal(1)
        expect(otherPost.status).equal(1)
        upvotePostId = upVotePost.postId
        downvotePostId = downVotePost.postId
        otherPostId = otherPost.postId

        chainId = await unirep.chainid()
    })

    after(async function () {
        await stopServer('vote', snapshot, sync, express)
    })

    async function voteForPost(postId, voteAction, epochKeyProof) {
        return express
            .post('/api/vote')
            .set('content-type', 'application/json')
            .send(
                stringifyBigInts({
                    postId: postId,
                    voteAction,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof,
                    onCancel: false,
                })
            )
    }

    async function verifyPostVote(postId, expectedUpCount, expectedDownCount) {
        const post = await anondb.findOne('Post', {
            where: { postId: postId },
        })

        expect(post).to.exist
        expect(post.upCount).equal(expectedUpCount)
        expect(post.downCount).equal(expectedDownCount)
    }

    it('should vote for post', async function () {
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0
        })

        // check socket message
        socketClient.on(EventType.VOTE, (data: VoteMsg) => {
            expect(data.postId).not.equal(undefined)
            expect(data.epoch).equal(1)

            if (data.postId == upvotePostId) {
                expect(data.vote).equal(VoteAction.UPVOTE)
            } else if (data.postId == downvotePostId) {
                expect(data.vote).equal(VoteAction.DOWNVOTE)
            }
        })

        // upvote for post
        const upvoteResponse = await voteForPost(
            upvotePostId,
            VoteAction.UPVOTE,
            epochKeyProof
        )
        expect(upvoteResponse).to.have.status(201)
        // check the post is upvoted only
        await verifyPostVote(upvotePostId, 1, 0)

        // downvote for post
        const downvoteResponse = await voteForPost(
            downvotePostId,
            VoteAction.DOWNVOTE,
            epochKeyProof
        )
        expect(downvoteResponse).to.have.status(201)

        // check the post is downvoted only
        await verifyPostVote(downvotePostId, 0, 1)
    })

    it('should vote failed when vote again with the same type', async function () {
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0
        })

        // make sure the post is already upvoted
        await verifyPostVote(upvotePostId, 1, 0)
        // then upvote post again
        const upvoteResponse = await voteForPost(
            upvotePostId,
            VoteAction.UPVOTE,
            epochKeyProof
        )
        expect(upvoteResponse).to.have.status(400)
        expect(upvoteResponse.body.error).equal('Invalid vote action')

        // make sure the post is already downvoted
        await verifyPostVote(downvotePostId, 0, 1)
        // then downvote post again
        const downvoteResponse = await voteForPost(
            downvotePostId,
            VoteAction.DOWNVOTE,
            epochKeyProof
        )
        expect(downvoteResponse).to.have.status(400)
        expect(downvoteResponse.body.error).equal('Invalid vote action')
    })

    it('should vote failed when vote again with different type', async function () {
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0
        })

        // make sure the post is already upvoted
        await verifyPostVote(upvotePostId, 1, 0)
        // then downvote for the upvoted post
        const downvoteResponse = await voteForPost(
            upvotePostId,
            VoteAction.DOWNVOTE,
            epochKeyProof
        )
        expect(downvoteResponse).to.have.status(400)
        expect(downvoteResponse.body.error).equal('Invalid vote action')

        // make sure the post is already downvoted
        await verifyPostVote(downvotePostId, 0, 1)
        // then upvote for the downvoted post
        const upvoteResponse = await voteForPost(
            downvotePostId,
            VoteAction.UPVOTE,
            epochKeyProof
        )

        expect(upvoteResponse).to.have.status(400)
        expect(upvoteResponse.body.error).equal('Invalid vote action')
    })

    it('should cancel vote for post', async function () {
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0
        })

        // make sure the post is already upvoted
        await verifyPostVote(upvotePostId, 1, 0)
        // then cancel upvote for the post
        const upvoteResponse = await voteForPost(
            upvotePostId,
            VoteAction.CANCEL_UPVOTE,
            epochKeyProof
        )
        expect(upvoteResponse).to.have.status(201)
        // check the post is neither upvoted nor downvoted
        await verifyPostVote(upvotePostId, 0, 0)

        // make sure the post is already downvoted
        await verifyPostVote(downvotePostId, 0, 1)
        // then cancel downvote for the post
        const downvoteResponse = await voteForPost(
            downvotePostId,
            VoteAction.CANCEL_DOWNVOTE,
            epochKeyProof
        )
        expect(downvoteResponse).to.have.status(201)
        // check the post is neither upvoted nor downvoted
        await verifyPostVote(downvotePostId, 0, 0)

        // TODO: need to setup response otherwise won't get anything from res
    })

    it('should vote failed when cancel upvote(downvote) for post w/o upvote(downvote)', async function () {
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0
        })

        // make sure the post is not upvoted
        await verifyPostVote(upvotePostId, 0, 0)
        // then cancel upvote for post without upvote
        const upvoteResponse = await voteForPost(
            upvotePostId,
            VoteAction.CANCEL_UPVOTE,
            epochKeyProof
        )
        expect(upvoteResponse).to.have.status(400)
        expect(upvoteResponse.body.error).equal('Invalid vote action')

        // make sure the post is not downvoted
        await verifyPostVote(downvotePostId, 0, 0)
        // then cancel downvote for post without downvote
        const downvoteResponse = await voteForPost(
            downvotePostId,
            VoteAction.CANCEL_DOWNVOTE,
            epochKeyProof
        )
        expect(downvoteResponse).to.have.status(400)
        expect(downvoteResponse.body.error).equal('Invalid vote action')
    })

    it('should vote failed with wrong epoch', async function () {
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

        // upvote with the wrong epoch
        const upvoteResponse = await voteForPost(
            otherPostId,
            VoteAction.UPVOTE,
            epochKeyProof
        )
        expect(upvoteResponse).to.have.status(400)
        expect(upvoteResponse.body.error).equal('Invalid epoch')
    })

    it('should vote failed with wrong proof', async function () {
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0
        })

        epochKeyProof.publicSignals[0] = BigInt(0)

        // upvote with the wrong proof
        const upvoteResponse = await voteForPost(
            otherPostId,
            VoteAction.UPVOTE,
            epochKeyProof
        )
        expect(upvoteResponse).to.have.status(400)
        expect(upvoteResponse.body.error).equal('Invalid proof')
    })

    it('should vote failed with invalid post', async function () {
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0
        })

        // upvote with the wrong post id
        const upvoteResponse = await voteForPost(
            'invalid',
            VoteAction.UPVOTE,
            epochKeyProof
        )
        expect(upvoteResponse).to.have.status(400)
        expect(upvoteResponse.body.error).equal('Invalid postId')
    })
})
