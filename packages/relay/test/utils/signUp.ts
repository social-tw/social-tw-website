import { User } from '../../src/types'
import { Wallet } from 'ethers'
import { UserStateFactory } from './UserStateFactory'
import { UserService } from '../../src/services/UserService'
import { UnirepSocialSynchronizer } from '../../src/services/singletons/UnirepSocialSynchronizer'
import { UserState } from '@unirep/core'

export async function signUp(
    user: User,
    userStateFactory: UserStateFactory,
    userService: UserService,
    synchronizer: UnirepSocialSynchronizer,
    wallet?: Wallet
): Promise<UserState> {
    const userState = await userStateFactory.createUserState(user, wallet)
    await userStateFactory.initUserState(userState)
    const { signupProof, publicSignals } = await userStateFactory.genProof(
        userState
    )

    const fromServer = wallet ? false : true

    // sign up
    await userService.signup(
        publicSignals,
        signupProof._snarkProof,
        user.hashUserId,
        fromServer,
        synchronizer
    )

    return userState
}
