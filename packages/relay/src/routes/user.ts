import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import crypto from 'crypto'
import UserRegisterState from '../singletons/UserRegisterState'
import TwitterClient from '../singletons/TwitterClient'
import { APP_ADDRESS, CLIENT_URL } from '../config'
import { UserRegisterStatus } from '../enums/userRegisterStatus'
import TransactionManager from '../singletons/TransactionManager'

const STATE = "state"
const code_challenge = crypto.randomUUID()

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    app.get('/api/login', async (_, res) => {
        const url = await TwitterClient.authClient.generateAuthURL({
            state: STATE,
            code_challenge,
        })
        res.status(200).json({ url: url })
    })

    app.get('/api/user', async (req, res) => {
        try {
            const { state, code } = req.query;

            if (state != STATE) res.status(500).json({ "error": "wrong callback value" })

            TwitterClient.authClient.requestAccessToken(code as string)
                .then(_ => TwitterClient.client.users.findMyUser())
                .then(async userInfo => {

                    const userId = userInfo.data?.id!!
                    const hash = crypto.createHash('sha3-224')
                    const hashUserId = hash.update(userId).digest('hex')
                    const appContract = TransactionManager.appContract!!

                    // query from contract
                    var statusCode = await appContract.queryUserStatus(hashUserId)

                    // if status is NOT_REGISTER or INIT then init user status
                    if (parseInt(statusCode) <= UserRegisterStatus.INIT) {
                        const calldata = await appContract.interface.encodeFunctionData(
                            'initUserStatus', [hashUserId]
                        )
                        const parsedLogs = await TransactionManager.executeTransaction(appContract, APP_ADDRESS, calldata);
                        console.log(parsedLogs)
                        const resultStatus = parseInt(parsedLogs[0]?.args[0])
                        if (resultStatus) {
                            statusCode = resultStatus
                        }
                    }

                    res.redirect(`${CLIENT_URL}?code=${hashUserId}&status=${parseInt(statusCode)}`)
                })
                .catch(err => () => {
                    console.error(err)
                    res.redirect(`${CLIENT_URL}?error="apiError"`)
                })

        } catch (error) {
            console.error(error)
            res.redirect(`${CLIENT_URL}?error="generalError"`)
        }
    })
}
