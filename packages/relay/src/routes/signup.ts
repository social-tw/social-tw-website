import { Express } from 'express'
import { DB } from 'anondb/node'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { userService } from '../services/UserService'
import { errorHandler } from '../services/singletons/errorHandler'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/signup',
        errorHandler(async (req, res, _) => {
            const { publicSignals, proof, hashUserId, token, fromServer } =
                req.body
            await userService.verifyHashUserId(db, hashUserId, token)
            const { txHash } = await userService.signup(
                publicSignals,
                proof,
                hashUserId,
                fromServer,
                synchronizer
            )
            res.status(200).json({ status: 'success', hash: txHash })
        })
    )
}
