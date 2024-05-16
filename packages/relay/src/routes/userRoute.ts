import { DB } from 'anondb/node'
import crypto from 'crypto'
import { Express } from 'express'
import { CLIENT_URL } from '../config'
import { userService } from '../services/UserService'
import TwitterClient from '../services/singletons/TwitterClient'
import { errorHandler } from '../services/singletons/ErrorHandler'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'

const STATE = 'state'
const code_challenge = crypto.randomUUID()

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.get('/api/login', async (_, res) => {
        const url = TwitterClient.authClient.generateAuthURL({
            state: STATE,
            code_challenge,
        })
        res.status(200).json({ url })
    })

    app.get('/api/user', async (req, res) => {
        const { state, code } = req.query

        try {
            const user = await userService.login(
                state as string,
                code as string,
                db
            )
            var redirectUrl = `${CLIENT_URL}/login?code=${user.hashUserId}&status=${user.status}&token=${user.token}&signMsg=${user.signMsg}`

            res.redirect(redirectUrl)
        } catch (error) {
            console.error(error)
            res.redirect(`${CLIENT_URL}/login?error=apiError`)
        }
    })

    app.post(
        '/api/signup',
        errorHandler(async (req, res, _) => {
            const { publicSignals, proof, hashUserId, token, fromServer } =
                req.body
            await userService.verifyHashUserId(db, hashUserId, token)
            const txHash = await userService.signup(
                publicSignals,
                proof,
                hashUserId,
                fromServer,
                synchronizer
            )
            res.status(200).json({ status: 'success', txHash })
        })
    )
}
