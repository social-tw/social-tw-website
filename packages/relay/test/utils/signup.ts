import { UserState } from '@unirep/core'
import { stringifyBigInts } from '@unirep/utils'
import { expect } from 'chai'
import { userService } from '../../src/services/UserService'
import { IdentityObject } from './types'
import { genUserState } from './userHelper'

export async function signUp(
    user: IdentityObject,
    context
): Promise<UserState> {
    const { app, db, prover, provider, sync } = context
    const userState = await genUserState(user.id, sync, app, db, prover)
    const { publicSignals, _snarkProof: proof } =
        await userState.genUserSignUpProof()
    const txHash = await userService.signup(
        stringifyBigInts(publicSignals),
        proof,
        user.hashUserId,
        false,
        sync
    )
    await provider.waitForTransaction(txHash)

    await sync.waitForSync()
    await userState.waitForSync()
    const hasSignedUp = await userState.hasSignedUp()
    expect(hasSignedUp).equal(true)

    return userState
}
