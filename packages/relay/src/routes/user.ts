import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import crypto from 'crypto'
import TwitterClient from '../singletons/TwitterClient'
import { CLIENT_URL } from '../config'

const STATE = "state"
const code_challenge = crypto.randomUUID()

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    app.get('/api/login', async (_, res) => {
        const url = await TwitterClient.authClient.generateAuthURL({
            state: STATE,
            code_challenge,
        })
        res.status(200).json({url: url})
    })

    app.get('/api/user', async (req, res) => {
        try {
            const { state, code } = req.query;

            if (state != STATE) res.status(500).json({ "error": "wrong callback value" })

            TwitterClient.authClient.requestAccessToken(code as string)
                .then(_ => TwitterClient.client.users.findMyUser())
                .then(async userInfo => {

                    // todo check hash function require?
                    const userId = userInfo.data?.id!!
                    const hash = crypto.createHash('sha3-224')
                    const hashUserId = hash.update(userId).digest('hex')

                    // todo change to use sc below
                    // check user already signup, if not yet, then record it with status
                    const user = await db.findOne('User', {
                        where: { userId: hashUserId }
                    })
                    if (!user) {
                        db.create('User', { userId: hashUserId, status: 0 })
                    }

                    res.redirect(`${CLIENT_URL}?code=${hashUserId}`)
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
