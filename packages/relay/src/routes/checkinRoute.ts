import { DB } from 'anondb/node'
import { Express } from 'express'
import { reputationService } from '../services/ReputationService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/checkin',
        errorHandler(async (req, res) => {
            const { publicSignals, proof } = req.body

            const txHash = await reputationService.claimCheckInReputation(
                publicSignals,
                proof,
                db,
                synchronizer
            )

            res.json({ txHash })
        })
    )
}
