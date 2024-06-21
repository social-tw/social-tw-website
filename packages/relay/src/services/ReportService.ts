import { Request, Response } from 'express'
import { DB } from 'anondb/node'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import ProofHelper from './utils/ProofHelper'
import { TransactionManager } from './utils/TransactionManager'


class ReportService {
    async claimPositiveReputation(
        req: Request,
        res: Response,
        db: DB,
        synchronizer: UnirepSocialSynchronizer
    ) {
        const { userId, reportId, nullifier } = req.body

        try {
            // generate proof
            const { proof, publicSignals } = await ProofHelper.genProofAndPublicSignals('reportPosRepProof', {
                userId,
                reportId,
                nullifier,
            })

            // verify proof
            const isProofValid = await ProofHelper.verifyProof('reportPosRepProof', publicSignals, proof)
            if (!isProofValid) {
                return res.status(400).json({ message: 'Invalid positive reputation proof' })
            }

            // send transaction to claim reputation
            const txResult = await TransactionManager.callContract('claimPositiveReputation', [
                userId,
                reportId,
                nullifier,
                proof,
                publicSignals
            ])

            // update nullifier status
            await db.update('Nullifiers', { where: { nullifier }, update: { status: true } })

            // record reputation claim
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

    async claimNegativeReputation(
        req: Request,
        res: Response,
        db: DB,
        synchronizer: UnirepSocialSynchronizer
    ) {
        const { userId, reportId, nullifier } = req.body

        try {
            // generate proof
            const { proof, publicSignals } = await ProofHelper.genProofAndPublicSignals('reportNegRepProof', {
                userId,
                reportId,
                nullifier,
            })

            // verify proof
            const isProofValid = await ProofHelper.verifyProof('reportNegRepProof', publicSignals, proof)
            if (!isProofValid) {
                return res.status(400).json({ message: 'Invalid negative reputation proof' })
            }

            // send transaction to claim reputation
            const txResult = await TransactionManager.callContract('claimNegativeReputation', [
                userId,
                reportId,
                nullifier,
                proof,
                publicSignals
            ])

            // update nullifier status
            await db.update('Nullifiers', { where: { nullifier }, update: { status: true } })

            // record reputation claim
            await db.create('ClaimedReputationHistory', {
                userId,
                reportId,
                claimType: 'negative',
                reputation: -1,
                epochKey: publicSignals.epochKey,
            })

            return res.status(200).json({ message: 'Reputation claimed successfully', txHash: txResult.txHash })
        } catch (error) {
            console.error('Error claiming negative reputation:', error)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }
}

export const reportService = new ReportService()