import { EpochKeyProof, EpochKeyLiteProof } from '@unirep/circuits'
import { UnirepSocialSynchronizer } from '../singletons/UnirepSocialSynchronizer'
import { PublicSignals, Groth16Proof } from 'snarkjs'
import {
    InvalidAttesterIdError,
    InvalidEpochError,
    InvalidProofError,
    InvalidStateTreeError,
} from '../../types/InternalError'
import { Synchronizer } from '@unirep/core'

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

    async getAndVerifyEpochKeyLiteProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer,
        enableEpochValidation: boolean = false
    ): Promise<EpochKeyLiteProof> {
        const epochKeyLiteProof = new EpochKeyLiteProof(
            publicSignals,
            proof,
            synchronizer.prover
        )

        // check if attester id is valid
        this.validateAttesterId(synchronizer, epochKeyLiteProof)

        // check if epoch is valid, if onCancel is true, we don't need to validate the epoch cause is canceling the vote, it will bring the epoch back to the old one
        if (!enableEpochValidation) {
            await this.validateEpoch(synchronizer, epochKeyLiteProof)
        }

        const isProofValid = await epochKeyLiteProof.verify()
        if (!isProofValid) {
            throw InvalidProofError
        }

        return epochKeyLiteProof
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
