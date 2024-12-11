import { SignupProof } from '@unirep/circuits'
import { DB } from 'anondb/node'
import crypto from 'crypto'
import fetch from 'node-fetch'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import { TWITTER_USER_URL } from '../config'
import { Errors, User, UserRegisterStatus } from '../types'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import ProofHelper from './utils/ProofHelper'
import TransactionManager from './utils/TransactionManager'
import TwitterClient from './utils/TwitterClient'

const STATE = 'state'

export class UserService {
    /**
     * Return User with hashUserId and loginStatus
     * - loginStatus = NOT_REGISTERD : User hasn't been registered
     * - loginStatus = REGISTERED: User has been signUp with own wallet
     * - loginStatus = REGISTERED_SERVER: User has been signUp with server wallet
     *                 In this case, signMsg will be included
     *
     * @param state from twitter api callback
     * @param code from twitter api callback
     */
    async login(state: string, code: string, db: DB): Promise<User> {
        if (state != STATE) throw Error('wrong callback value')

        try {
            const response = await TwitterClient.authClient.requestAccessToken(
                code as string,
            )
            const userInfo = await TwitterClient.client.users.findMyUser()
            const userId = userInfo.data?.id
            if (!userId) throw Errors.USER_LOGIN_ERROR('User ID not found')
            return await this.getLoginUser(
                db,
                userId,
                response.token.access_token,
            )
        } catch (error: any) {
            console.error('Error in user login:', error)
            throw Errors.USER_LOGIN_ERROR(`User login failed: ${error.message}`)
        }
    }

    /**
     *
     * @param userId twitter user id
     * @returns hashed user id
     */
    encodeUserId(userId: string) {
        const hash = crypto.createHash('sha3-224')
        return `0x${hash.update(userId).digest('hex')}`
    }

    // no matter signup / login, relayer sign the message first
    // pass the signature to frontend, let user decide to choose
    // from server or from wallet
    async getLoginUser(db: DB, userId: string, accessToken?: string) {
        const hashUserId = this.encodeUserId(userId)
        const wallet = TransactionManager.wallet!!
        const user: User = {
            hashUserId: hashUserId,
            token: accessToken,
            signMsg: await wallet.signMessage(hashUserId),
            status: UserRegisterStatus.INIT,
        }

        const signUpUser = await db.findOne('SignUp', {
            where: {
                hashUserId: hashUserId,
            },
        })

        if (signUpUser != null) {
            user.status = signUpUser.status
        }

        return user
    }

    async signup(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        hashUserId: string,
        fromServer: boolean,
        synchronizer: UnirepSocialSynchronizer,
    ) {
        const signupProof = new SignupProof(
            publicSignals,
            proof,
            synchronizer.prover,
        )

        // verify attesterId, should be the same as app
        ProofHelper.validateAttesterId(synchronizer, signupProof)

        // double confirm the commitment exist or not
        const commitment = signupProof.identityCommitment.toString()
        const attesterId = signupProof.attesterId.toString()
        const isUserExist = await synchronizer.db.findOne('UserSignUp', {
            where: {
                commitment,
                attesterId,
            },
        })
        if (isUserExist) throw Errors.USER_ALREADY_SIGNED_UP()

        await ProofHelper.validateEpoch(synchronizer, signupProof)

        const valid = await signupProof.verify()
        if (!valid) throw Errors.INVALID_PROOF()

        const txHash = await TransactionManager.callContract('userSignUp', [
            signupProof.publicSignals,
            signupProof.proof,
            hashUserId,
            fromServer,
        ])

        return txHash
    }

    async verifyHashUserId(db: DB, hashUserId: string, accessToken: string) {
        const user = await db.findOne('SignUp', {
            where: {
                hashUserId: hashUserId,
            },
        })

        if (user != null) throw Errors.USER_ALREADY_SIGNED_UP()

        const response: any = await fetch(TWITTER_USER_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then((r) => r.json())

        if (this.encodeUserId(response?.data?.id) != hashUserId) {
            console.error(
                `AccessToken is invalid or user ${hashUserId} is not matched`,
            )
            throw Errors.INVALID_HASH_USER_ID()
        }
    }
}

export const userService = new UserService()
