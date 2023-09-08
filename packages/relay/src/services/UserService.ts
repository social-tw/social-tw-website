import { SignupProof } from '@unirep/circuits'
import { SnarkProof } from '@unirep/utils'
import { UnirepSocialSynchronizer } from '../synchornizer'
import TransactionManager from '../singletons/TransactionManager'
import { APP_ADDRESS, TWITTER_USER_URL } from '../config'
import TwitterClient from '../singletons/TwitterClient'
import crypto from 'crypto'
import User from '../data/User'
import { DB } from 'anondb/node'
import { UserRegisterStatus } from '../enums/userRegisterStatus'

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
            const response = await TwitterClient.authClient
                .requestAccessToken(code as string)
            const userInfo = await TwitterClient.client.users.findMyUser()
            const userId = userInfo.data?.id!!
            return await this.getLoginUser(db, userId, response.token.access_token)
        } catch (error) {
            console.log('error in getting user id', error)
            throw Error('Error in login')
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

    async getLoginUser(db: DB, userId: string, accessToken: string | undefined) {
        const hashUserId = this.encodeUserId(userId)
        const user: User = {
            hashUserId: hashUserId,
            token: accessToken,
            signMsg: undefined,
            status: UserRegisterStatus.INIT
        }
        
        const signUpUser = await db.findOne('SignUp', {
            where: {
                hashUserId: hashUserId
            }
        })

        // login from server needs to set signMsg
        if (signUpUser != null) {
            if (signUpUser.status == UserRegisterStatus.REGISTERER_SERVER) {
                const wallet = TransactionManager.wallet!!
                user.signMsg = await wallet.signMessage(hashUserId)
                user.status = signUpUser.status
            } else {
                user.status = signUpUser.status
            }
        }

        return user
    }

    async signup(
        publicSignals: string[],
        proof: SnarkProof,
        hashUserId: string,
        fromServer: boolean,
        synchronizer: UnirepSocialSynchronizer
    ) {

        const signupProof = new SignupProof(
            publicSignals,
            proof,
            synchronizer.prover
        )
        const valid = await signupProof.verify()
        if (!valid) {
            throw new Error('Invalid proof')
        }
        const currentEpoch = synchronizer.calcCurrentEpoch()
        if (currentEpoch !== Number(signupProof.epoch)) {
            throw new Error('Wrong epoch')
        }
        const appContract = TransactionManager.appContract!!
        const calldata = appContract.interface.encodeFunctionData(
            'userSignUp',
            [
                signupProof.publicSignals,
                signupProof.proof,
                hashUserId,
                fromServer,
            ]
        )

        const parsedLogs = await TransactionManager.executeTransaction(
            appContract,
            APP_ADDRESS,
            calldata
        )

        return ''
    }

    async verifyHashUserId(db: DB, hashUserId: string, accessToken: string) {
        const user = await db.findOne("SignUp", {
            where: {
                hashUserId: hashUserId
            }
        })

        if (user != null) {
            throw Error(`The user has already signed up.`)
        }

        const response = await fetch(TWITTER_USER_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        }).then((r) => r.json())

        if (this.encodeUserId(response?.data?.id) != hashUserId) {
            console.error(`AccessToken is invalid or user ${hashUserId} is not matched`)
            throw Error("AccessToken is invalid or wrong userId")
        }
    }
}

export const userService = new UserService()
