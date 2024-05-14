import { Express } from 'express'
import { DB } from 'anondb/node'
import TransactionManager from '../services/utils/TransactionManager'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import ProofHelper from '../services/utils/ProofHelper'
import { errorHandler } from '../services/utils/ErrorHandler'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
) => {
    app.post(
        '/api/request',
        errorHandler(async (req, res) => {
            const { reqData, publicSignals, proof } = req.body

            const epochKeyProof = await ProofHelper.getAndVerifyEpochKeyProof(
                publicSignals,
                proof,
                synchronizer,
            )

            const epoch = epochKeyProof.epoch
            const keys = Object.keys(reqData)
            let txHash: any
            if (keys.length === 1) {
                txHash = await TransactionManager.callContract(
                    'submitAttestation',
                    [epochKeyProof.epochKey, epoch, keys[0], reqData[keys[0]]],
                )
            } else if (keys.length > 1) {
                txHash = await TransactionManager.callContract(
                    'submitManyAttestations',
                    [
                        epochKeyProof.epochKey,
                        epoch,
                        keys,
                        keys.map((k) => reqData[k]),
                    ],
                )
            }

            res.json({ txHash })
        })
    )
}
