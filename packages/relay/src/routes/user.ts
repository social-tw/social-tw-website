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
            var redirectUrl = await userService.getRedirectUrl(state as string, code as string)
            res.redirect(redirectUrl)
        } catch (error) {
            return `${CLIENT_URL}?error="apiError"`
        }
    })
}
