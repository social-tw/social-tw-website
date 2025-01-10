import { DB } from 'anondb/node'
import { Express } from 'express'
import { APP_ADDRESS, ETH_PROVIDER_URL, UNIREP_ADDRESS } from '../config'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'

export default (
    app: Express,
    _: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.get('/api/config', async (_, res) => {
        const epochLength =
            await synchronizer.unirepContract.attesterEpochLength(
                BigInt(APP_ADDRESS).toString()
            )

        const dailyCurrentEpoch =
            await synchronizer.unirepSocialContract.dailyCurrentEpoch()

        res.json({
            UNIREP_ADDRESS,
            APP_ADDRESS,
            ETH_PROVIDER_URL,
            EPOCH_LENGTH: epochLength,
            DAILY_CURRENT_EPOCH: dailyCurrentEpoch,
        })
    })
}
