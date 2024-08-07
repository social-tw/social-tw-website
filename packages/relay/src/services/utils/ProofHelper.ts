import {
    EpochKeyLiteProof,
    EpochKeyProof,
    ReputationProof,
} from '@unirep/circuits'
import { Synchronizer } from '@unirep/core'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import {
    InvalidAttesterIdError,
    InvalidEpochError,
    InvalidProofError,
    InvalidReputationProofError,
    InvalidStateTreeError,
} from '../../types'
import { UnirepSocialSynchronizer } from '../singletons/UnirepSocialSynchronizer'
import Prover from './Prover'

class ProofHelper {
    async getAndVerifyEpochKeyProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<EpochKeyProof> {
        // verify epochKeyProof of user
        const epochKeyProof = new EpochKeyProof(
            publicSignals,
            proof,
            synchronizer.prover
        )

        // check if attester id is valid
        this.validateAttesterId(synchronizer, epochKeyProof)

        // check if epoch is valid
        await this.validateEpoch(synchronizer, epochKeyProof)

        // check if state tree exists in current epoch
        const isStateTreeValid = await synchronizer.stateTreeRootExists(
            epochKeyProof.stateTreeRoot,
            Number(epochKeyProof.epoch),
            epochKeyProof.attesterId
        )
        if (!isStateTreeValid) {
            throw InvalidStateTreeError
        }

        // check if proof is valid
        const isProofValid = await epochKeyProof.verify()
        if (!isProofValid) {
            throw InvalidProofError
        }

        return epochKeyProof
    }

    // this if for not check epoch consistency
    async getAndVerifyEpochKeyLiteProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<EpochKeyLiteProof> {
        const epochKeyLiteProof = new EpochKeyLiteProof(
            publicSignals,
            proof,
            synchronizer.prover
        )

        // check if attester id is valid
        this.validateAttesterId(synchronizer, epochKeyLiteProof)

        const isProofValid = await epochKeyLiteProof.verify()
        if (!isProofValid) {
            throw InvalidProofError
        }

        return epochKeyLiteProof
    }

    async getAndVerifyReputationProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<ReputationProof> {
        const reputationProof = new ReputationProof(
            publicSignals,
            proof,
            synchronizer.prover
        )

        this.validateAttesterId(synchronizer, reputationProof)
        await this.validateEpoch(synchronizer, reputationProof)

        const isProofValid = await reputationProof.verify()
        if (!isProofValid) {
            throw InvalidReputationProofError
        }

        return reputationProof
    }

    // TODO: when ReportIdentityProof type is created, need to modify
    // ReportIndentityProof rip = new ReportIdentityProof(publicSignals, proof)
    async verifyReportIdentityProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<void> {
        const isProofValid = await Prover.verifyProof(
            'reportIdentityProof',
            publicSignals,
            proof
        )
        if (!isProofValid) {
            throw InvalidProofError
        }

        const attesterId = publicSignals[1]
        const epoch = publicSignals[2]
        const stateTreeRoot = publicSignals[3]

        // check if epoch is valid
        const currentEpoch = await synchronizer.loadCurrentEpoch()
        if (!(epoch.toString() === currentEpoch.toString())) {
            throw InvalidEpochError
        }

        // check state root is valid
        const isStateTreeValid = await synchronizer.stateTreeRootExists(
            stateTreeRoot,
            Number(epoch),
            attesterId
        )
        if (!isStateTreeValid) {
            throw InvalidStateTreeError
        }

        // check if attesterId is valid
        if (!(synchronizer.attesterId === BigInt(attesterId))) {
            throw InvalidAttesterIdError
        }
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
        if (!(proof.epoch.toString() === epoch.toString())) {
            throw InvalidEpochError
        }
    }

    /**
     * we should validate the attester id before we execute the transaction
     *
     * @param attesterId the attester id to be validated
     * @param expectedAttesterId the attester id for validation
     * @throws InvalidAttesterIdError if the attester id is invalid
     */
    validateAttesterId(synchronizer: Synchronizer, proof: any) {
        if (!(synchronizer.attesterId === proof.attesterId)) {
            throw InvalidAttesterIdError
        }
    }
}

export default new ProofHelper()
