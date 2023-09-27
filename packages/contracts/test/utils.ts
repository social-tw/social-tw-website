import { ethers } from 'hardhat'
import { Identity } from '@semaphore-protocol/identity'
import { schema, UserState } from '@unirep/core'
import { SQLiteConnector } from 'anondb/node'
import { defaultProver as prover } from '@unirep-app/circuits/provers/defaultProver'
import crypto from 'crypto'

export function createRandomUserIdentity(): [string, Identity] {
    const hash = crypto.createHash('sha3-224')
    const hashUserId = `0x${hash
        .update(new Identity().toString())
        .digest('hex')}` as string
    const id = new Identity(hashUserId) as Identity
    // console.log('Random hashed user id: ', hashUserId)

    return [hashUserId, id]
}

export async function genUserState(id, app) {
    // generate a user state
    const db = await SQLiteConnector.create(schema, ':memory:')
    const unirepAddress = await app.unirep()
    const attesterId = BigInt(app.address)
    const userState = new UserState({
        db,
        prover,
        unirepAddress,
        provider: ethers.provider,
        attesterId,
        id,
    })
    await userState.sync.start()
    await userState.waitForSync()
    return userState
}
