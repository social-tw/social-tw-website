import { Identity } from '@semaphore-protocol/identity'
import { UserState } from '@unirep/core'
import crypto from 'crypto'
import { ethers } from 'hardhat'
import { UnirepSocialSynchronizer } from '../../src/services/singletons/UnirepSocialSynchronizer'
import { IdentityObject } from './types'

export function createRandomUserIdentity(): IdentityObject {
    const hash = crypto.createHash('sha3-224')
    const hashUserId = `0x${hash
        .update(new Identity().toString())
        .digest('hex')}` as string
    const id = new Identity(hashUserId)

    return { hashUserId, id }
}

export function createUserIdentities(size: number): IdentityObject[] {
    let result: IdentityObject[] = []
    for (let i = 0; i < size; i++) {
        result.push(createRandomUserIdentity())
    }
    return result
}

export async function genUserState(id, app, db, prover) {
    // generate a user state
    const unirepAddress = await app.unirep()
    const attesterId = BigInt(app.address)
    const synchronizer = new UnirepSocialSynchronizer(
        {
            db,
            attesterId,
            prover,
            provider: ethers.provider,
            unirepAddress,
        },
        app
    )

    const userState = new UserState({
        synchronizer,
        db,
        prover,
        unirepAddress,
        provider: ethers.provider,
        attesterId,
        id,
    })
    await userState.start()
    await userState.waitForSync()
    return userState
}