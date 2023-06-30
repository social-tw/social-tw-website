import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import crypto from 'crypto'
import { CLIENT_URL } from '../config'
import twitterHelper from '../singletons/twitterHelper'
import TwitterClient from '../singletons/TwitterClient'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    // for backend test use
    app.get('/api/login', async (req, res) => {
        const code_challenge = crypto.randomUUID()
        console.log('code challenge', code_challenge)
        res.redirect(
            TwitterClient.authClient.generateAuthURL({
                state: 'state',
                code_challenge,
            })
        )
    })

    // for backend test use
    app.get('/api/callback', async (req, res) => {
        res.json(req.query)
    })

    app.post('/api/user', async (req, res) => {
        try {
            const { code, code_verifier } = req.body

            const twitterOAuthToken = await twitterHelper.getTwitterOAuthToken(
                code as string,
                code_verifier as string
            )

            if (!twitterOAuthToken) {
                return res.redirect(CLIENT_URL)
            }

            const twitterUser = await twitterHelper.getTwitterUser(
                twitterOAuthToken.access_token
            )

            if (!twitterUser) {
                return res.redirect(CLIENT_URL)
            }

            // todo check hash function require?
            const hash = crypto.createHash('sha3-224')
            const hashUserId = hash.update(twitterUser.id).digest('hex')

            // todo change to use sc below
            // check user already signup, if not yet, then record it with status
            const user = await db.findOne('User', {
                where: { userId: hashUserId },
            })
            if (!user) {
                db.create('User', { userId: hashUserId, status: 0 })
            }

            res.json({ userId: hashUserId })
        } catch (error) {
            res.status(500).json({ error })
        }
    })
}
