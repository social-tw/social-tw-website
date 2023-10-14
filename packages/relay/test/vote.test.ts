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
import { genEpochKeyProof, randomData } from './utils/genProof'

describe('POST /vote', function () {
    let snapshot: any
    let anondb: DB
    let tm: TransactionManager
    let express: Server
    let userStateFactory: UserStateFactory
    let userState: UserState
    let sync: UnirepSocialSynchronizer
    let post: any


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

        //Create a Post for vote
        const testContent = 'test content'
        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })
        
        const postRes: any = await fetch(`${HTTP_SERVER}/api/post`, {
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
        post = postRes.post
        console.log(post)
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
        const res: any = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    postId: post._id,
                    voteAction: "UPVOTE",
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        expect(res.post.upCount).equal(1)

        //TODO check vote database?
    })

    it('should vote failed with wrong epoch', async function () {
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

        const res: any = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    postId: post._id,
                    voteAction: "UPVOTE",
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })
        expect(res.error).equal('Invalid Epoch')
        userState.sync.stop()
    })

    it('shuold vote failed with wrong proof', async function () {
        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        epochKeyProof.publicSignals[0] = BigInt(0)

        const res: any = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    postId: post._id,
                    voteAction: "UPVOTE",
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        expect(res.error).equal('Invalid proof')
        userState.sync.stop()
    })

    it('should vote failed with invalid post', async function () {
        var epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        //Upvote for post
        const res: any = await fetch(`${HTTP_SERVER}/api/vote`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(
                stringifyBigInts({
                    postId: "invalid",
                    voteAction: "UPVOTE",
                    publicSignals: epochKeyProof.publicSignals,
                    proof: epochKeyProof.proof
                })
            ),
        }).then((r) => {
            expect(r.status).equal(200)
            return r.json()
        })

        expect(res.post.upCount).equal(1)
    })

    it('should vote failed with invalid vote action', async function () {
        
    })
})