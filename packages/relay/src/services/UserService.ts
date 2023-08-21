import { SignupProof } from '@unirep/circuits'
import { SnarkProof } from '@unirep/utils'
import { UnirepSocialSynchronizer } from '../synchornizer'
import TransactionManager from '../singletons/TransactionManager'
import { APP_ADDRESS, CLIENT_URL } from '../config'
import TwitterClient from '../singletons/TwitterClient'
import crypto from 'crypto'
import { UserRegisterStatus } from '../enums/userRegisterStatus'
import { Contract } from 'ethers'

const STATE = 'state'

export class UserService {

    /**
     * Return redirect url with hashUserId and loginStatus
     * - loginStatus = INIT: User has been initialize, then process sign up
     * - loginStatus = REGISTERED: User has been signUp with own wallet
     * - loginStatus = REGISTERED_SERVER: User has been signUp with server wallet
     *                 In this case, signature is carried in redirectUrl  
     * 
     * @param code from twitter api callback
     * @param state from twitter api callback
     */
    async getRedirectUrl(code: string, state: string): Promise<string> {
        if (state != STATE)
            throw Error("wrong callback value")

        var userInfo = await TwitterClient.authClient.requestAccessToken(code as string)
            .then((_) => TwitterClient.client.users.findMyUser())

        const userId = userInfo.data?.id!!
        const hash = crypto.createHash('sha3-224')
        const hashUserId = `0x${hash.update(userId).digest('hex')}`
        const appContract = TransactionManager.appContract!!

        // query from contract
        let statusCode = await appContract.queryUserStatus(
            hashUserId
        )

        // if status is NOT_REGISTER or INIT then init user status
        statusCode = parseInt(statusCode)
        if (statusCode <= UserRegisterStatus.INIT) {
            return await this.initUser(hashUserId, appContract)
        } else if (
            statusCode == UserRegisterStatus.REGISTERER
        ) {
            return `${CLIENT_URL}?code=${hashUserId}&status=${statusCode}`
        } else if (
            statusCode ==
            UserRegisterStatus.REGISTERER_SERVER
        ) {
            const wallet = TransactionManager.wallet!!
            const signMsg = await wallet.signMessage(hashUserId)
            return `${CLIENT_URL}?code=${hashUserId}&status=${statusCode}&signMsg=${signMsg}`
        } else {
            console.log(`Get unknow status from ${hashUserId}`)
            throw Error("Unknown status")
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
        const calldata = appContract.interface.encodeFunctionData('userSignUp', [
            signupProof.publicSignals,
            signupProof.proof,
            hashUserId,
            fromServer,
        ])

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

    private async initUser(hashUserId: string, appContract: Contract): Promise<string> {
        const calldata =
            appContract.interface.encodeFunctionData(
                'initUserStatus',
                [hashUserId]
            )
        const parsedLogs =
            await TransactionManager.executeTransaction(
                appContract,
                APP_ADDRESS,
                calldata
            )
        const resultStatus = parseInt(parsedLogs[0]?.args[0])
        if (resultStatus) {
            return `${CLIENT_URL}?code=${hashUserId}&status=${resultStatus}`
        } else {
            console.log(`There is no result status in ${hashUserId}`)
            throw Error("Create User Failed")
        }
    }

}

export const userService = new UserService()