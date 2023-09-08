import { SignupProof } from '@unirep/circuits'
import { SnarkProof } from '@unirep/utils'
import { UnirepSocialSynchronizer } from '../synchornizer'
import TransactionManager from '../singletons/TransactionManager'
import { APP_ADDRESS, CLIENT_URL, TWITTER_ACCESS_TOKEN_URL, TWITTER_USER_URL } from '../config'
import TwitterClient from '../singletons/TwitterClient'
import crypto from 'crypto'
import { UserRegisterStatus } from '../enums/userRegisterStatus'
import { Contract } from 'ethers'
import User from '../data/User'

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
    async login(state: string, code: string): Promise<User> {
        if (state != STATE) throw Error('wrong callback value')

        try {
            const response = await TwitterClient.authClient
                .requestAccessToken(code as string)
            const userInfo = await TwitterClient.client.users.findMyUser()
            const userId = userInfo.data?.id!!
            return await this.getLoginUser(userId, response.token.access_token)
        } catch (error) {
            console.log('error in getting user id', error)
            throw Error('Error in login')
        }
    }

    async getLoginUser(userId: string, accessToken: string | undefined) {
        const hash = crypto.createHash('sha3-224')
        const hashUserId = `0x${hash.update(userId).digest('hex')}`
        const appContract = TransactionManager.appContract!!

        // query from contract
        let statusCode = await appContract.queryUserStatus(hashUserId)

        statusCode = parseInt(statusCode)
        if (statusCode == UserRegisterStatus.REGISTERER) {
            return { hashUserId, status: statusCode, signMsg: undefined, token: undefined}
        } else if (statusCode == UserRegisterStatus.REGISTERER_SERVER) {
            const wallet = TransactionManager.wallet!!
            const signMsg = await wallet.signMessage(hashUserId)
            return { hashUserId, status: statusCode, signMsg: signMsg, token: undefined }
        } 
            
        // if status is NOT_REGISTER then carry accessToken to verify in signUp step
        return { hashUserId, status: statusCode, signMsg: undefined, token: accessToken }
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

    async verifyHashUserIdFromToken(hashUserId: string, accessToken: string) {

        const response = await fetch(TWITTER_USER_URL, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((r) => r.json())

        if (response?.data?.userId != hashUserId) {
            console.error(`AccessToken is invalid or user ${hashUserId} is not matched`)
            throw Error("AccessToken is invalid or wrong userId")
        }
    }
}

export const userService = new UserService()
