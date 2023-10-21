import { EpochKeyProof } from '@unirep/circuits'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { SnarkProof } from '@unirep/utils'

class EpochKeyService {
    async getAndVerifyProof(
        publicSignals: (bigint | string)[],
        proof: SnarkProof,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<EpochKeyProof> {
        // verify epochKeyProof of user
        const epochKeyProof = new EpochKeyProof(
            publicSignals,
            proof,
            synchronizer.prover
        )

        // get current epoch and unirep contract
        const epoch = await synchronizer.loadCurrentEpoch()

        // check if epoch is valid
        const isEpochvalid = epochKeyProof.epoch.toString() === epoch.toString()
        if (!isEpochvalid) {
            throw new Error('Invalid Epoch')
        }

        // check if state tree exists in current epoch
        const isStateTreeValid = await synchronizer.stateTreeRootExists(
            epochKeyProof.stateTreeRoot,
            Number(epochKeyProof.epoch),
            epochKeyProof.attesterId
        )
        if (!isStateTreeValid) {
            throw new Error('Invalid State Tree')
        }

        // check if proof is valid
        const isProofValid = await epochKeyProof.verify()
        if (!isProofValid) {
            throw new Error('Invalid proof')
        }

        return epochKeyProof
    }
}

export const epochKeyService = new EpochKeyService()
