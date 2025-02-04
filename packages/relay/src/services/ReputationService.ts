import { DB } from 'anondb/node'
import type { Groth16Proof, PublicSignals } from 'snarkjs'
import { Errors } from '../types'
import {
    ClaimHelpers,
    RepChangeType,
    ReputationHistory,
    ReputationType,
} from '../types/Reputation'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import ProofHelper, { genVHelperIdentifier } from './utils/ProofHelper'
import TransactionManager from './utils/TransactionManager'

export class ReputationService {
    async findManyReputationHistory(
        fromEpoch: number,
        toEpoch: number,
        db: DB
    ): Promise<ReputationHistory[] | null> {
        const reputations = await db.findMany('ReputationHistory', {
            where: {
                epoch: {
                    gte: fromEpoch,
                    lte: toEpoch,
                },
            },
            orderBy: {
                epoch: 'desc',
            },
            include: {
                report: true,
            },
        })

        return reputations
    }

    async claimCheckInReputation(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        db: DB,
        synchronizer: UnirepSocialSynchronizer
    ) {
        const dailyClaimProof = await ProofHelper.getAndVerifyDailyClaimProof(
            publicSignals,
            proof,
            synchronizer
        )

        // check positive reputation
        const maxRep = dailyClaimProof.maxRep
        const proveMaxRep = dailyClaimProof.proveMaxRep

        if (!(maxRep > 0 && proveMaxRep > 0))
            throw Errors.POSITIVE_REPUTATION_USER()

        const identifier = genVHelperIdentifier(ClaimHelpers.DailyClaimVHelper)

        const txHash = await TransactionManager.callContract(
            'claimDailyLoginRep',
            [publicSignals, proof, identifier]
        )

        db.create('ReputationHistory', {
            transactionHash: txHash,
            epoch: Number(dailyClaimProof.epoch),
            epochKey: String(dailyClaimProof.epochKey),
            score: RepChangeType.CHECK_IN_REP,
            type: ReputationType.CHECK_IN,
            reportId: null,
        })

        return txHash
    }
}

export const reputationService = new ReputationService()
