import { DB } from 'anondb/node'
import { Express } from 'express'
import { EPOCHKEYS_AMOUNT } from '../config'
import { counterService } from '../services/CounterService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import { Errors } from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
) => {
    app.get(
        '/api/counter',
        errorHandler(async (req, res, _) => {
            const epks =
                typeof req.query.epks === 'string'
                    ? req.query.epks.split('_')
                    : undefined
            // each user has 3 epoch keys during the epoch
            if (!epks || epks.length != EPOCHKEYS_AMOUNT)
                throw Errors.WRONG_EPOCH_KEY_NUMBER()

            const counter = await counterService.fetchActions(epks, db)

            res.json({ counter })
        }),
    )
}
