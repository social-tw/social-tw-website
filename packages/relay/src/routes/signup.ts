import { Express } from 'express'
import { DB } from 'anondb/node'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { userService } from '../services/UserService'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post('/api/signup', async (req, res) => {
        try {
            const { publicSignals, proof, hashUserId, token, fromServer } =
                req.body
            await userService.verifyHashUserId(db, hashUserId, token)
            const hash = await userService.signup(
                publicSignals,
                proof,
                hashUserId,
                fromServer,
                synchronizer
            )
            res.status(200).json({ status: 'success', hash: hash })
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('The user has already signed up.')
            ) {
                res.status(400).json({
                    error: 'The user has already signed up.',
                })
            } else {
                res.status(500).json({ error: 'Internal server error' })
            }
        }
    })
}
