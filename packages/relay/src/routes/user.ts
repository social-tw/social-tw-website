import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import crypto from 'crypto'
import TwitterClient from '../singletons/TwitterClient'

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    // for backend test use
    app.get('/api/login', async (req, res) => {
        const code_challenge = crypto.randomUUID()
        console.log('code challenge', code_challenge)
        res.json(
            TwitterClient.authClient.generateAuthURL({
                state: 'state',
                code_challenge,
            })
        )
    })

    // for backend test use
    app.get('/api/callback', async (req, res) => {
        console.log(req.query)
        res.json(req.query)
    })

    app.post('/api/user', async (req, res) => {
        try {
            const { state, code, code_verifier } = req.body;

            TwitterClient.authClient.generateAuthURL({
                state,
                code_challenge: code_verifier,
            })
            
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

                    res.json({ userId: hashUserId })
                })
                .catch(err => res.status(500).json({
                    error: `Failed in getting userID with ${err}`
                }))

        } catch (error) {
            res.status(500).json({ error })
        }
    })
}
