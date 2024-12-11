import { DB } from 'anondb/node'
import { Express } from 'express'
import { createCheckReputationMiddleware } from '../middlewares/CheckReputationMiddleware'
import { reputationService } from '../services/ReputationService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import { Errors } from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
) => {
    app.post(
        '/api/checkin',
        errorHandler(createCheckReputationMiddleware(synchronizer)),
        errorHandler(async (req, res) => {
            if (!res.locals.isNegativeReputation)
                throw Errors.POSITIVE_REPUTATION_USER()

            const { publicSignals, proof } = req.body

            const txHash = await reputationService.claimCheckInReputation(
                publicSignals,
                proof,
                db,
                synchronizer,
            )

            res.json({ txHash })
        }),
    )
}
