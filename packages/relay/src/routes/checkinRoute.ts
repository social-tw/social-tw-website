import { DB } from 'anondb/node'
import { Express } from 'express'
import { checkReputation } from '../middlewares/CheckReputationMiddleware'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import ProofHelper from '../services/utils/ProofHelper'
import TransactionManager from '../services/utils/TransactionManager'
import { PositiveReputationUserError } from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/checkin',
        errorHandler(checkReputation),
        errorHandler(async (req, res) => {
            if (!res.locals.isNegativeReputation)
                throw PositiveReputationUserError

            const { publicSignals, proof } = req.body

            const epochKeyLiteProof =
                await ProofHelper.getAndVerifyEpochKeyLiteProof(
                    publicSignals,
                    proof,
                    synchronizer
                )

            const txHash = await TransactionManager.callContract(
                'claimDailyLoginRep',
                [epochKeyLiteProof.publicSignals, epochKeyLiteProof.proof]
            )

            res.json({ txHash })
        })
    )
}
