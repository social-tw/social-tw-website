import { EpochKeyProof } from '@unirep/circuits'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { SnarkProof } from '@unirep/utils'
import { ethers } from 'ethers'
import ABI from '@unirep-app/contracts/abi/UnirepApp.json'
import { APP_ADDRESS, LOAD_POST_COUNT } from '../config'
import TransactionManager from '../singletons/TransactionManager'
import { ipfsService } from '../services/IpfsService'
import type { DB } from 'anondb/node'
import type { Helia } from '@helia/interface'

interface CreateEntryArg {
    epochKeyProof: string;
    txHash: string;
    epoch: bigint;
    args: any[];
}

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

    async callContractAndProve(
        functionSignature: string,
        args: any[],
        publicSignals: (bigint | string)[],
        proof: SnarkProof,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<{
        epochKeyProof: string, 
        txHash: string, 
        epoch: bigint,
        args: any[]
    }> {
        const appContract = new ethers.Contract(APP_ADDRESS, ABI)
        const epochKeyProof = await epochKeyService.getAndVerifyProof(
            publicSignals,
            proof,
            synchronizer
        )

        const calldata = appContract.interface.encodeFunctionData(
            functionSignature,
            [epochKeyProof.publicSignals, epochKeyProof.proof, ...args]
        )
        const hash = await TransactionManager.queueTransaction(
            APP_ADDRESS,
            calldata
        )

        // FIXME: error handling

        return {
            'epochKeyProof': epochKeyProof.epochKey.toString(),
            'txHash': hash,
            'epoch': epochKeyProof.epoch,
            'args': args,
        }
    }

    // method interacting with db with epochKeyProof
    async createEntryDbIpfs(
        entryName: string,
        arg: CreateEntryArg,
        helia: Helia,
        db: DB,
    ): Promise<any> {
        let baseArg = {};
        const cid = ipfsService.createIpfsContent(helia, arg[0]);
        baseArg['cid'] = cid;
        baseArg['status'] = 0;
        Object.entries(arg).forEach(([key, value]) => {
            baseArg[key] = value;
        });

        const entry = await db.create(entryName, baseArg)

        // FIXME: error handling
        return entry
    }
}

export const epochKeyService = new EpochKeyService()
