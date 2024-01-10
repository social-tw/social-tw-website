import { ethers } from 'ethers'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import ABI from '@unirep-app/contracts/abi/UnirepApp.json'
import { EpochKeyLiteProof, EpochKeyProof } from '@unirep/circuits'
import { APP_ADDRESS } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { InternalError } from '../types/InternalError'

class EpochKeyService {
    async getAndVerifyProof(
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

        // get current epoch and unirep contract
        const epoch = await synchronizer.loadCurrentEpoch()

        // check if epoch is valid
        const isEpochvalid = epochKeyProof.epoch.toString() === epoch.toString()
        if (!isEpochvalid) {
            throw new InternalError('Invalid Epoch', 400)
        }

        // check if state tree exists in current epoch
        const isStateTreeValid = await synchronizer.stateTreeRootExists(
            epochKeyProof.stateTreeRoot,
            Number(epochKeyProof.epoch),
            epochKeyProof.attesterId
        )
        if (!isStateTreeValid) {
            throw new InternalError('Invalid State Tree', 400)
        }

        // check if proof is valid
        const isProofValid = await epochKeyProof.verify()
        if (!isProofValid) {
            throw new InternalError('Invalid proof', 400)
        }

        return epochKeyProof
    }

    async getAndVerifyLiteProof(
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<EpochKeyLiteProof> {
        const epochKeyLiteProof = new EpochKeyLiteProof(
            publicSignals,
            proof,
            synchronizer.prover
        )

        // get current epoch and unirep contract
        const epoch = await synchronizer.loadCurrentEpoch()

        // check if epoch is valid
        const isEpochvalid =
            epochKeyLiteProof.epoch.toString() === epoch.toString()
        if (!isEpochvalid) {
            throw new InternalError('Invalid Epoch', 400)
        }

        const isProofValid = await epochKeyLiteProof.verify()
        if (!isProofValid) {
            throw new InternalError('Invalid proof', 400)
        }

        return epochKeyLiteProof
    }

    // TODO move this to other service?
    async callContract(
        functionSignature: string, // 'leaveComment' for example
        args: any[]
    ): Promise<string> {
        const appContract = new ethers.Contut -ract(APP_ADDRESS, ABI)
        const calldata = appContract.interface.encodeFunctionData(
            functionSignature,
            [...args]
        )
        const hash = await TransactionManager.queueTransaction(
            APP_ADDRESS,
            calldata
        )

        return hash
    }
}

export const epochKeyService = new EpochKeyService()
