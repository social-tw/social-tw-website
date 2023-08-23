import { Express } from 'express'
import { DB } from 'anondb/node'
import crypto from 'crypto'
import TwitterClient from '../singletons/TwitterClient'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { userService } from '../services/UserService'
import { CLIENT_URL } from '../config'

const STATE = 'state'
const code_challenge = crypto.randomUUID()

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.get('/api/login', async (_, res) => {
        const url = await TwitterClient.authClient.generateAuthURL({
            state: STATE,
            code_challenge,
        })
        res.status(200).json({ url: url })
    })

    app.get('/api/user', async (req, res) => {
        const { state, code } = req.query

        try {
            const user = await userService.loginOrInitUser(
                state as string,
                code as string
            )
            var redirectUrl = `${CLIENT_URL}?code=${user.hashUserId}&status=${user.status}`
            if (user.signMsg) redirectUrl += `&signMsg=${user.signMsg}`

<<<<<<< HEAD
            res.redirect(redirectUrl)
=======
            if (state != STATE)
                res.status(500).json({ error: 'wrong callback value' })

            TwitterClient.authClient
                .requestAccessToken(code as string)
                .then((_) => TwitterClient.client.users.findMyUser())
                .then(async (userInfo) => {
                    const userId = userInfo.data?.id!!
                    const hash = crypto.createHash('sha3-224')
                    const hashUserId = `0x${hash.update(userId).digest('hex')}`
                    const appContract = TransactionManager.appContract!!

                    // query from contract
                    let statusCode = await appContract.queryUserStatus(
                        hashUserId
                    )

                    // if status is NOT_REGISTER or INIT then init user status
                    if (parseInt(statusCode) <= UserRegisterStatus.INIT) {
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
                        console.log(parsedLogs)
                        const resultStatus = parseInt(parsedLogs[0]?.args[0])
                        if (resultStatus) {
                            statusCode = resultStatus
                            res.redirect(
                                `${CLIENT_URL}?code=${hashUserId}&status=${parseInt(
                                    statusCode
                                )}`
                            )
                        }
                    } else if (
                        parseInt(statusCode) == UserRegisterStatus.REGISTERER
                    ) {
                        res.redirect(
                            `${CLIENT_URL}?code=${hashUserId}&status=${parseInt(
                                statusCode
                            )}`
                        )
                    } else if (
                        parseInt(statusCode) ==
                        UserRegisterStatus.REGISTERER_SERVER
                    ) {
                        const wallet = TransactionManager.wallet!!
                        const signMsg = await wallet.signMessage(hashUserId)
                        res.redirect(
                            `${CLIENT_URL}?code=${hashUserId}&status=${parseInt(
                                statusCode
                            )}&signMsg=${signMsg}`
                        )
                    }
                })
                .catch((err) => () => {
                    console.error(err)
                    res.redirect(`${CLIENT_URL}?error="apiError"`)
                })
>>>>>>> 3c40e27 (chore: fix lint)
        } catch (error) {
            console.log(error)
            res.redirect(`${CLIENT_URL}?error="apiError"`)
        }
    })
}
