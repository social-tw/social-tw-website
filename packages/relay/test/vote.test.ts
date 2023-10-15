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
    })

    after(async function () {
        await ethers.provider.send('evm_revert', [snapshot])
        express.close()
    })

    it('should vote for post', async function () {
        let res = await post(userState)
        res = await post(userState)
        await ethers.provider.waitForTransaction(res.transaction)
        await sync.waitForSync()
        var posts: any = await fetch(`${HTTP_SERVER}/api/post`).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })
        let upVotePost = posts[posts.length - 1]
        let downVotePost = posts[posts.length - 2]
        expect(upVotePost.status).equal(1)
        expect(downVotePost.status).equal(1)

        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        //Upvote for post
        res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upVotePost._id,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(201)
            return r.json()
        })

        //Downvote for post
        res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: downVotePost._id,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(201)
            return r.json()
        })

        // expect(res.post.upCount).equal(1)
        userState.sync.stop()
    })

    it('should cancel vote for post', async function () {
        var posts: any = await fetch(`${HTTP_SERVER}/api/post`).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })
        let upVotePost = posts[posts.length - 1]
        let downVotePost = posts[posts.length - 2]
        expect(upVotePost.status).equal(1)
        expect(downVotePost.status).equal(1)

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
                    _id: upVotePost._id,
                    voteAction: VoteAction.CANCEL_UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(201)
            return r.json()
        })

        //Cancel downvote for post
        res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: downVotePost._id,
                    voteAction: VoteAction.CANCEL_UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(201)
            return r.json()
        })

        // TODO: need to setup response otherwise won't get anything from res
        // expect(res.post.upCount).equal(0)
        userState.sync.stop()
        //TODO check vote database?
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

    it('shuold vote failed with wrong proof', async function () {
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
            nonce: 1,
        })

        //Upvote for post
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

    it('should vote failed with invalid vote action', async function () {
        var posts: any = await fetch(`${HTTP_SERVER}/api/post`).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })
        let upVotePost = posts[posts.length - 1]
        let downVotePost = posts[posts.length - 2]
        expect(upVotePost.status).equal(1)
        expect(downVotePost.status).equal(1)

        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        //Cancel upvote for post without upvote 
        let res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upVotePost._id,
                    voteAction: VoteAction.CANCEL_UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal("Invalid vote action")

        //Cancel downvote for post without upvote 
        res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: downVotePost._id,
                    voteAction: VoteAction.CANCEL_DOWNVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal("Invalid vote action")

        //Upvote post twice
        res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upVotePost._id,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(201)
            return r.json()
        })
        res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upVotePost._id,
                    voteAction: VoteAction.UPVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal("Invalid vote action")

        //down vote for post which is Upvoted
        res = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    _id: upVotePost._id,
                    voteAction: VoteAction.DOWNVOTE,
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(400)
            return r.json()
        })

        expect(res.error).equal("Invalid vote action")
    })
})