import fetch from 'node-fetch'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'

import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'
import { userService } from '../src/services/UserService'

let userState: UserState

describe('POST /post', () => {
    beforeEach(async () => {
        // deploy contracts
        const { unirep, app } = await deployContracts()
        // start server
        const { db, prover, provider, TransactionManager, synchronizer } = await startServer(
            unirep,
            app
        )

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
            publicSignals, signupProof._snarkProof, initUser.hashUserId, false, synchronizer
        )

        await userState.waitForSync()
        const hasSignedUp = await userState.hasSignedUp()
        expect(hasSignedUp).equal(true)
    })

    it('should create a post', async () => {
        // FIXME: Look for fuzzer to test content
        const testContent = 'test content'

        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })

        const res = await fetch(`${HTTP_SERVER}/api/post`, {
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
        //expect(res.status).equal(200)
        //expect(res.body).('postId')
        // TODO: verify post
        // [ ] verify transaction
        // [ ] fetch post
    })

    // TODO
    //it('should post failed with wrong proof', async () => {})
})
