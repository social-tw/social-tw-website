import { SignupProof } from '@unirep/circuits'
import { SnarkProof } from '@unirep/utils'
import { UnirepSocialSynchronizer } from '../synchornizer'
import TransactionManager from '../singletons/TransactionManager'
import { APP_ADDRESS, CLIENT_URL } from '../config'
import TwitterClient from '../singletons/TwitterClient'
import crypto from 'crypto'
import { UserRegisterStatus } from '../enums/userRegisterStatus'
import { Contract } from 'ethers'
import User from '../data/User'

const STATE = 'state'

export class UserService {
    /**
     * Return User with hashUserId and loginStatus
     * - loginStatus = INIT: User has been initialize, then process sign up
     * - loginStatus = REGISTERED: User has been signUp with own wallet
     * - loginStatus = REGISTERED_SERVER: User has been signUp with server wallet
     *                 In this case, signMsg will be included
     *
     * @param code from twitter api callback
     * @param state from twitter api callback
     */
    async loginOrInitUser(state: string, code: string): Promise<User> {
        if (state != STATE) throw Error('wrong callback value')

        var userInfo = await TwitterClient.authClient
            .requestAccessToken(code as string)
            .then((_) => TwitterClient.client.users.findMyUser())

        const userId = userInfo.data?.id!!
        return this.loginOrInitUserForTest(userId)
    }

    // TODO remove this method, once successfully mock the TwitterClient result
    async loginOrInitUserForTest(userId: string): Promise<User> {
        const hash = crypto.createHash('sha3-224')
        const hashUserId = `0x${hash.update(userId).digest('hex')}`
        const appContract = TransactionManager.appContract!!

        // query from contract
        let statusCode = await appContract.queryUserStatus(hashUserId)

        // if status is NOT_REGISTER or INIT then init user status
        statusCode = parseInt(statusCode)
        if (statusCode <= UserRegisterStatus.INIT) {
            return await this.initUser(hashUserId, appContract)
        } else if (statusCode == UserRegisterStatus.REGISTERER) {
            return { hashUserId, status: statusCode, signMsg: undefined }
        } else if (statusCode == UserRegisterStatus.REGISTERER_SERVER) {
            const wallet = TransactionManager.wallet!!
            const signMsg = await wallet.signMessage(hashUserId)
            return { hashUserId, status: statusCode, signMsg: signMsg }
        } else {
            console.log(`Get unknow status from ${hashUserId}`)
            throw Error('Unknown status')
        }
    }

    async signup(
        publicSignals: string[],
        proof: SnarkProof,
        hashUserId: String,
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

        // TODO: fix transction twice bug
        /*
        const hash = await TransactionManager.queueTransaction(
            APP_ADDRESS,
            calldata
        )
        */

        const parsedLogs = await TransactionManager.executeTransaction(
            appContract,
            APP_ADDRESS,
            calldata
        )

        return '' //hash
    }

    private async initUser(
        hashUserId: string,
        appContract: Contract
    ): Promise<User> {
        const calldata = appContract.interface.encodeFunctionData(
            'initUserStatus',
            [hashUserId]
        )
        const parsedLogs = await TransactionManager.executeTransaction(
            appContract,
            APP_ADDRESS,
            calldata
        )
        const status = parseInt(parsedLogs[0]?.args[0])
        if (status) {
            return {
                hashUserId,
                status: UserRegisterStatus.INIT,
                signMsg: undefined,
            }
        } else {
            console.log(`There is no result status in ${hashUserId}`)
            throw Error('Create User Failed')
        }
    }
}

export const userService = new UserService()
