import { UserStateTransitionProof } from '@unirep/circuits'
import { DB } from 'anondb/node'
import { Express } from 'express'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import TransactionManager from '../services/utils/TransactionManager'
import { Errors } from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
) => {
    app.post(
        '/api/transition',
        errorHandler(async (req, res) => {
            const { publicSignals, proof } = req.body
            const transitionProof = new UserStateTransitionProof(
                publicSignals,
                proof,
                synchronizer.prover,
            )
            const valid = await transitionProof.verify()
            if (!valid) throw Errors.INVALID_PROOF()

            const calldata =
                synchronizer.unirepContract.interface.encodeFunctionData(
                    'userStateTransition',
                    [transitionProof.publicSignals, transitionProof.proof],
                )
            const txHash = await TransactionManager.queueTransaction(
                synchronizer.unirepContract.address,
                calldata,
            )
            res.json({ txHash })
        }),
    )
}
