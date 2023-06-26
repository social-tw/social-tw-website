import { Express } from 'express'
import { DB } from 'anondb/node'
import { Synchronizer } from '@unirep/core'
import TwitterClient from '../singletons/TwitterClient'
import { ethers } from 'ethers';
import crypto from 'crypto';

const STATE = crypto.randomUUID()

export default (app: Express, db: DB, synchronizer: Synchronizer) => {
    app.get('/api/login', async (req, res) => {
        res.redirect(TwitterClient.authClient.generateAuthURL({
            state: STATE,
            code_challenge: "BDcX6UdIZ7uAJdWnCsaKL0G9O2rwzvu4"
        }))
    })

    app.get('/api/callback', async (req, res) => {
        try {
            const { code, state } = req.query;
            if (state !== STATE)
                return res.status(500).json({
                    error: "State isn't matching"
                });
            
            TwitterClient.authClient.requestAccessToken(code as string)
                .then(_ => TwitterClient.client.users.findMyUser())
                .then(async userInfo => {

                    const userId = userInfo.data?.id
                    if (!userId) throw new Error('No userId')
                    
                    // todo check hash function require?
                    const hash = crypto.createHash('md5')
                    const hashUserId = hash.update(userId).digest('hex')
                    
                    // todo change to use sc below
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
