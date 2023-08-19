import fetch from 'node-fetch'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'

import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'

let userState: UserState

describe('POST /post', () => {
    beforeEach(async () => {
        // deploy contracts
        const { unirep, app } = await deployContracts()
        // start server
        const { db, prover, provider } = await startServer(unirep, app)
        // register
        // TODO: userState Init could be modularized to a helper function
        const identity = new Identity('')
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

        const data = (await fetch(`${HTTP_SERVER}/api/signup`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                publicSignals: signupProof.publicSignals.map((n) =>
                    n.toString()
                ),
                proof: signupProof.proof,
                hashUserId:
                    '0x4ee4fc00d2af5a41fe62fb8520a327e5d9f36001494f6fc4518c4a82',
                fromServer: true,
            }),
        }).then((r) => r.json())) as { status: number; hash: string }

        await provider.waitForTransaction(data.hash)
        await userState.waitForSync()
        const hasSignedUp = await userState.hasSignedUp()
        const latestTransitionedEpoch = userState.sync.calcCurrentEpoch()
        console.log(hasSignedUp)
    })

    it('should create a post', async () => {
        // TODO: Look for fuzzer to test content
        const testContent = 'test content'

        const epochKeyProof = await userState.genEpochKeyProof({
            nonce: 0,
        })
        /*
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
        console.log(res)*/
        //expect(res.status).equal(200)
        //expect(res.body).('postId')
        // TODO: verify post
        // [ ] verify transaction
        // [ ] fetch post
    })

    // TODO
    //it('should post failed with wrong proof', async () => {})
})
