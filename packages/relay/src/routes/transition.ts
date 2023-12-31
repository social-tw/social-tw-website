import { Express } from 'express'
import { DB } from 'anondb/node'
import { UserStateTransitionProof } from '@unirep/circuits'
import TransactionManager from '../services/singletons/TransactionManager'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/singletons/errorHandler'
import { InvalidProofError } from '../types/InternalError'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/transition',
        errorHandler(async (req, res) => {
            const { publicSignals, proof } = req.body
            const transitionProof = new UserStateTransitionProof(
                publicSignals,
                proof,
                synchronizer.prover
            )
            const valid = await transitionProof.verify()
            if (!valid) {
                throw InvalidProofError
            }

            const calldata =
                synchronizer.unirepContract.interface.encodeFunctionData(
                    'userStateTransition',
                    [transitionProof.publicSignals, transitionProof.proof]
                )
            const hash = await TransactionManager.queueTransaction(
                synchronizer.unirepContract.address,
                calldata
            )
            res.json({ hash })
        })
    )
}
