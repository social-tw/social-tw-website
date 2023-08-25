import fetch from 'node-fetch'
import { ethers } from 'hardhat'
import { expect } from 'chai'

import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'

import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'

import { Server } from 'http'
import { userService } from '../src/services/UserService'
import { UnirepSocialSynchronizer } from '../src/synchornizer'
import user from '../src/routes/user'

let snapshot: any
let express: Server
let userState: UserState
let sync: UnirepSocialSynchronizer

describe('POST /post', () => {
    beforeEach(async () => {
        snapshot = await ethers.provider.send('evm_snapshot', [])
        // deploy contracts
        const { unirep, app } = await deployContracts()
        // start server
        const { db, prover, provider, synchronizer, server } =
            await startServer(unirep, app)
        express = server
        sync = synchronizer

        // initUserStatus
        var initUser = await userService.loginOrInitUserForTest('123')
        const wallet = ethers.Wallet.createRandom()
        const signature = await wallet.signMessage(initUser.hashUserId)
        const identity = new Identity(signature)
        userState = new UserState({
            db,
            provider,
            prover,
            unirepAddress: unirep.address,
            attesterId: BigInt(app.address),
            id: identity,
        })

        await userState.sync.start()
        await userState.waitForSync()

        const signupProof = await userState.genUserSignUpProof()
        var publicSignals = signupProof.publicSignals.map((n) => n.toString())
        // sign up
        await userService.signup(
            publicSignals,
            signupProof._snarkProof,
            initUser.hashUserId,
            false,
            synchronizer
        )

        await userState.waitForSync()
        const hasSignedUp = await userState.hasSignedUp()
        expect(hasSignedUp).equal(true)
    })

    afterEach(async () => {
        ethers.provider.send('evm_revert', [snapshot])
        express.close()
    })

    it('should create a post', async () => {
        // FIXME: Look for fuzzer to test content
        const testContent = 'test content'

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

        expect(res.post.status).equal(0)
        await ethers.provider.waitForTransaction(res.transaction)
        await userState.sync.waitForSync()
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

    it('should post failed with wrong proof', async () => {
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
})
