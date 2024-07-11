import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { reputationService } from '../services/ReputationService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import Validator from '../services/utils/Validator'
import { InvalidEpochError } from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.get(
        '/api/reputation/history',
        errorHandler(async (req: Request, res: Response) => {
            const fromEpoch = Number(req.query.fromEpoch)
            const toEpoch = Number(req.query.toEpoch)

            if (
                !Validator.isValidNumber(fromEpoch) ||
                !Validator.isValidNumber(toEpoch)
            ) {
                throw InvalidEpochError
            }

            const reputations =
                await reputationService.findManyReputationHistory(
                    fromEpoch,
                    toEpoch,
                    db
                )

            res.json(reputations)
        })
    )
}
