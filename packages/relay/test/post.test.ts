import * as crypto from 'crypto'
import fetch from 'node-fetch'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'

import { HTTP_SERVER } from './configs'
import { deployContracts, startServer } from './environment'

let userState: UserState

function generateCharHash(data: string): string {
    const hash = crypto.createHash('sha256').update(data).digest('hex')
    return hash.substring(0, 56) // Truncate to 56 characters
}

describe('POST /post', () => {
    beforeEach(async () => {
        // deploy contracts
        const { unirep, app } = await deployContracts()
        // start server
        const { db, prover, provider, TransactionManager } = await startServer(
            unirep,
            app
        )
        // register
        // FIXME: userState Init could be modularized to a helper function
        const wallet = ethers.Wallet.createRandom()
        const hashUserId = '0x' + generateCharHash('Test User Hash Id')
        const signature = await wallet.signMessage(hashUserId)
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

        // initUserStatus
        const calldata = app.interface.encodeFunctionData('initUserStatus', [
            hashUserId,
        ])
        await TransactionManager.executeTransaction(app, app.address, calldata)
        await userState.waitForSync()

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
                hashUserId: hashUserId,
                fromServer: false,
            }),
        }).then((r) => r.json())) as { status: number; hash: string }

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
