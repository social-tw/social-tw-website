import { DB } from 'anondb/node'
import { Express } from 'express'
import { errorHandler } from '../middleware'
import { UnirepSocialSynchronizer } from '../synchornizer'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.get(
        '/api/counter',
        errorHandler(async (req, res, next) => {
            await fetchActions(req, res, db)
        })
    )
}

/**
 * fetch the number of actions of three epoch keys which derived from the identity
 *
 * @param req express request
 * @param res express response
 * @param db SQLiteConnector
 */
async function fetchActions(req, res, db: DB) {
    try {
        const epks = req.query.epks ? req.query.epks.split('_') : undefined
        // each user has 3 epoch keys during the epoch
        if (epks.length != 3) {
            res.status(400).json({ error: 'wrong number of epks' })
            return
        }

        let counter = 0

        const actions = await db.findMany('EpochKeyAction', {
            where: {
                epochKey: epks,
            },
        })

        if (actions) {
            // flapMap the actions to [count1, count2, count3],
            // then reduce array to accumulate each count
            counter = actions
                .flatMap((action) => action.count)
                .reduce((acc, count) => acc + count)
        }

        res.json({ counter: counter })
    } catch (error: any) {
        res.status(500).json({ error })
    }
}
