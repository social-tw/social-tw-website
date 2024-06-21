import { Request, Response } from 'express'
import { DB } from 'anondb/node'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import ProofHelper from './utils/ProofHelper'
import { TransactionManager } from './utils/TransactionManager'


export const claimPositiveReputation = async (
    req: Request,
    res: Response,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    const { userId, reportId, nullifier } = req.body

    try {
        // Generate the report nullifier proof
        const { proof, publicSignals } = await ProofHelper.genProofAndPublicSignals('reportNullifierCircuit', {
            userId,
            reportId,
            nullifier,
        })

        // Verify the report nullifier proof
        const isProofValid = await ProofHelper.verifyProof('reportNullifierCircuit', publicSignals, proof)
        if (!isProofValid) {
            return res.status(400).json({ message: 'Invalid report nullifier proof' })
        }

        // Send transaction to claim positive reputation
        const txResult = await TransactionManager.callContract('claimPositiveReputation', [
            userId,
            reportId,
            nullifier,
            proof,
            publicSignals
        ])

        // Update the status of the nullifier to 'claimed'
        await db.update('Nullifiers', { where: { nullifier }, update: { status: true } })

        // Add a record to claimedReputationHistory
        await db.create('ClaimedReputationHistory', {
            userId,
            reportId,
            claimType: 'positive',
            reputation: 1,
            epochKey: publicSignals.epochKey,
        })

        return res.status(200).json({ message: 'Reputation claimed successfully', txHash: txResult.txHash })
    } catch (error) {
        console.error('Error claiming positive reputation:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
