import { ethers } from 'hardhat'
import { expect } from 'chai'
import { DB } from 'anondb'
import { TransactionManager } from '../src/singletons/TransactionManager'

import { UserState } from '@unirep/core'
import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'
import {
    stringifyBigInts,
} from '@unirep/utils'

import { Server } from 'http'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/synchornizer'
import { UserStateFactory } from './utils/UserStateFactory'
import { singUp } from './utils/signUp'
import { post } from './utils/post'
import { VoteAction } from '../src/types'
import { genEpochKeyProof, randomData } from './utils/genProof'

describe('POST /vote', function () {
    let snapshot: any
    let anondb: DB
    let tm: TransactionManager
    let express: Server
    let userStateFactory: UserStateFactory
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let upvotePostId: string
    let downvotePostId: string


    before(async function () {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts(100000)
        // start server
        const { db, prover, provider, TransactionManager, server, synchronizer } =
            await startServer(unirep, app)

        anondb = db
        tm = TransactionManager
        express = server
        sync = synchronizer
        userStateFactory = new UserStateFactory(
            db,
            provider,
            prover,
            unirep,
            app,
            synchronizer
        )

        const initUser = await userService.getLoginUser(db, '123', undefined)
        userState = await singUp(
            initUser,
            userStateFactory,
            userService,
            synchronizer
        )

        await userState.waitForSync()
        const hasSignedUp = await userState.hasSignedUp()
        expect(hasSignedUp).equal(true)

        // post two posts
        let res = await post(userState)
        res = await post(userState)
        await ethers.provider.waitForTransaction(res.transaction)
        await sync.waitForSync()

        // get the post ids
        var posts: any = await fetch(`${HTTP_SERVER}/api/post`).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })
        let upVotePost = posts[posts.length - 1]
        let downVotePost = posts[posts.length - 2]
        expect(upVotePost.status).equal(1)
        expect(downVotePost.status).equal(1)
        upvotePostId = upVotePost._id
        downvotePostId = downVotePost._id
    })

    after(async function () {
        await ethers.provider.send('evm_revert', [snapshot])
        express.close()
    })

    it('should vote for post', async function () {
        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        //Upvote for post
        await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upvotePostId,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(201)
        })

        // check the post is upvoted only
        anondb.findOne('Post', {
            where: {
                _id: upvotePostId,
            },
        }).then((post) => {
            expect(post).to.exist
            expect(post.upCount).equal(1)
            expect(post.downCount).equal(0)
        })

        //Downvote for post
        await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: downvotePostId,
                    voteAction: VoteAction.DOWNVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(201)
        })

        // check the post is downvoted only
        anondb.findOne('Post', {
            where: {
                _id: downvotePostId,
            },
        }).then((post) => {
            expect(post).to.exist
            expect(post.upCount).equal(0)
            expect(post.downCount).equal(1)
        })

        userState.sync.stop()
    })

    it('should vote failed when vote again with the same type', async function () {
        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        // check the post is upvoted only
        anondb.findOne('Post', {
            where: {
                _id: upvotePostId,
            },
        }).then((post) => {
            expect(post).to.exist
            expect(post.upCount).equal(1)
            expect(post.downCount).equal(0)
        })

        // Upvote post again
        await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upvotePostId,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        }).then((res) => {
            expect(res.error).equal("Invalid vote action")
        })

        // check the post is downvoted only
        anondb.findOne('Post', {
            where: {
                _id: downvotePostId,
            },
        }).then((post) => {
            expect(post).to.exist
            expect(post.upCount).equal(0)
            expect(post.downCount).equal(1)
        })

        // Downvote post again
        await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: downvotePostId,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        }).then((res) => {
            expect(res.error).equal("Invalid vote action")
        })
    })

    it('should vote failed when vote again with different type', async function () {
        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        // check the post is upvoted only
        anondb.findOne('Post', {
            where: {
                _id: upvotePostId,
            },
        }).then((post) => {
            expect(post).to.exist
            expect(post.upCount).equal(1)
            expect(post.downCount).equal(0)
        })

        // Downvote for post which is Upvoted
        await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upvotePostId,
                    voteAction: VoteAction.DOWNVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        }).then((res) => {
            expect(res.error).equal("Invalid vote action")
        })

        // check the post is downvoted only
        anondb.findOne('Post', {
            where: {
                _id: downvotePostId,
            },
        }).then((post) => {
            expect(post).to.exist
            expect(post.upCount).equal(0)
            expect(post.downCount).equal(1)
        })

        // Upvote for post which is Downvoted
        await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: downvotePostId,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        }).then((res) => {
            expect(res.error).equal("Invalid vote action")
        })
    })

    it('should cancel vote for post', async function () {
        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        //Cancel upvote for post
        let res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upvotePostId,
                    voteAction: VoteAction.CANCEL_UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(201)
            return r.json()
        })

        // check the post is neither upvoted nor downvoted
        anondb.findOne('Post', {
            where: {
                _id: upvotePostId,
            },
        }).then((post) => {
            expect(post).to.exist
            expect(post.upCount).equal(0)
            expect(post.downCount).equal(0)
        })

        //Cancel downvote for post
        res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: downvotePostId,
                    voteAction: VoteAction.CANCEL_DOWNVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(201)
            return r.json()
        })

        // check the post is neither upvoted nor downvoted
        anondb.findOne('Post', {
            where: {
                _id: downvotePostId,
            },
        }).then((post) => {
            expect(post).to.exist
            expect(post.upCount).equal(0)
            expect(post.downCount).equal(0)
        })

        // TODO: need to setup response otherwise won't get anything from res
        userState.sync.stop()
    })

    it('should vote failed when cancel upvote(downvote) for post w/o upvote(downvote)', async function () {
        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        // Cancel upvote for post without upvote 
        await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upvotePostId,
                    voteAction: VoteAction.CANCEL_UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        }).then((res) => {
            expect(res.error).equal("Invalid vote action")
        })

        // Cancel downvote for post without downvote
        await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: downvotePostId,
                    voteAction: VoteAction.CANCEL_DOWNVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        }).then((res) => {
            expect(res.error).equal("Invalid vote action")
        })
    })

    it('should vote failed with wrong epoch', async function () {
        var posts: any = await fetch(`${HTTP_SERVER}/api/post`).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })
        let votePost = posts[posts.length - 1]
        expect(votePost.status).equal(1)

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

        let res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: votePost._id,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })
        expect(res.error).equal('Invalid Epoch')
        userState.sync.stop()
    })

    it('should vote failed with wrong proof', async function () {
        var posts: any = await fetch(`${HTTP_SERVER}/api/post`).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })
        let votePost = posts[posts.length - 1]
        expect(votePost.status).equal(1)

        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        epochKeyProof.publicSignals[0] = BigInt(0)

        let res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: votePost._id,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal('Invalid proof')
        userState.sync.stop()
    })

    it('should vote failed with invalid post', async function () {
        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        // Upvote for post
        const res: any = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: "invalid",
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal("Invalid postId")
        userState.sync.stop()
    })
})