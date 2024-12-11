import { DB } from 'anondb/node'
import crypto from 'crypto'
import { Express } from 'express'
import { CLIENT_URL } from '../config'
import TwitterClient from '../services/utils/TwitterClient'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { userService } from '../services/UserService'

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
            var redirectUrl = `${CLIENT_URL}/twitter/callback?code=${user.hashUserId}&status=${user.status}&token=${user.token}&signMsg=${user.signMsg}`

            res.redirect(redirectUrl)
        } catch (error) {
            console.error(error)
            res.redirect(`${CLIENT_URL}/login?error=apiError`)
        }
    })
}
