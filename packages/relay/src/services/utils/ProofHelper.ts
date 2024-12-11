import { ReportIdentityProof } from '@unirep-app/circuits'
import {
    EpochKeyLiteProof,
    EpochKeyProof,
    ReputationProof,
} from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'
import { ethers } from 'hardhat'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import { Errors } from '../../types'
import { UnirepSocialSynchronizer } from '../singletons/UnirepSocialSynchronizer'

class ProofHelper {
    async getAndVerifyEpochKeyProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer,
    ): Promise<EpochKeyProof> {
        // verify epochKeyProof of user
        const epochKeyProof = new EpochKeyProof(
            publicSignals,
            proof,
            synchronizer.prover,
        )

        // check if attester id is valid
        this.validateAttesterId(synchronizer, epochKeyProof)

        // check if epoch is valid
        await this.validateEpoch(synchronizer, epochKeyProof)

        // check if state tree exists in current epoch
        const isStateTreeValid = await synchronizer.stateTreeRootExists(
            epochKeyProof.stateTreeRoot,
            Number(epochKeyProof.epoch),
            epochKeyProof.attesterId,
        )
        if (!isStateTreeValid) throw Errors.INVALID_STATE_TREE()

        // check if proof is valid
        const isProofValid = await epochKeyProof.verify()
        if (!isProofValid) throw Errors.INVALID_PROOF()

        return epochKeyProof
    }

    // this if for not check epoch consistency
    async getAndVerifyEpochKeyLiteProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer,
    ): Promise<EpochKeyLiteProof> {
        const epochKeyLiteProof = new EpochKeyLiteProof(
            publicSignals,
            proof,
            synchronizer.prover,
        )

        // check if attester id is valid
        this.validateAttesterId(synchronizer, epochKeyLiteProof)

        const isProofValid = await epochKeyLiteProof.verify()
        if (!isProofValid) throw Errors.INVALID_PROOF()

        return epochKeyLiteProof
    }

    async getAndVerifyReputationProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer,
    ): Promise<ReputationProof> {
        const reputationProof = new ReputationProof(
            publicSignals,
            proof,
            synchronizer.prover,
        )

        this.validateAttesterId(synchronizer, reputationProof)
        await this.validateEpoch(synchronizer, reputationProof)

        const isProofValid = await reputationProof.verify()
        if (!isProofValid) {
            throw Errors.INVALID_REPUTATION_PROOF()
        }

        return reputationProof
    }

    async getAndVerifyReportIdentityProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer,
    ): Promise<ReportIdentityProof> {
        const reportIdentityProof = new ReportIdentityProof(
            publicSignals,
            proof,
            synchronizer.prover,
        )

        this.validateAttesterId(synchronizer, reportIdentityProof)
        await this.validateEpoch(synchronizer, reportIdentityProof)

        const isProofValid = await reportIdentityProof.verify()
        if (!isProofValid) throw Errors.INVALID_PROOF()

        return reportIdentityProof
    }

    /**
     * we should validate the epoch before we execute the transaction
     *
     * @param epoch the epoch to be validated
     * @param expectedEpoch the epoch for validation
     * @throws InvalidEpochError if the epoch is invalid
     */
    async validateEpoch(synchronizer: Synchronizer, proof: any) {
        // get current epoch and unirep contract
        const epoch = await synchronizer.loadCurrentEpoch()
        if (!(proof.epoch.toString() === epoch.toString()))
            throw Errors.INVALID_EPOCH()
    }

    /**
     * we should validate the attester id before we execute the transaction
     *
     * @param attesterId the attester id to be validated
     * @param expectedAttesterId the attester id for validation
     * @throws InvalidAttesterIdError if the attester id is invalid
     */
    validateAttesterId(synchronizer: Synchronizer, proof: any) {
        if (!(synchronizer.attesterId === proof.attesterId))
            throw Errors.INVALID_ATTESTER_ID()
    }
}

export function genVHelperIdentifier(identifier: string): string {
    const encodedId = ethers.utils.defaultAbiCoder.encode(
        ['string'],
        [identifier],
    )
    return ethers.utils.keccak256(encodedId)
}

export default new ProofHelper()
