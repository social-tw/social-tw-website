import { Prover } from '@unirep/circuits';
import { Groth16Proof, PublicSignals } from 'snarkjs';
import { UnirepSocialCircuit } from '../test/types';
import { UnirepSocialBaseProof } from './UnirepSocialBaseProof';

/**
 * Verify the voter identity for voting the report
 */
export class ReportIdentityProof extends UnirepSocialBaseProof {
    /**
     * Index mapping for public signals
     */
    readonly idx = {
        reportNullifier: 0,
        fromEpoch: 1,
        stateTreeRoot: 2,
    }
    
    /**
     * The nullifier of the report, ensuring that the same report cannot be submitted multiple times.
     */
    public reportNullifier: bigint

    /**
     * The epoch from which the report is made, used to validate the timing and context of the report.
     */
    public fromEpoch: bigint

    /**
     * The root of the state Merkle tree, representing the current state of the tree.
     */
    public stateTreeRoot: bigint

    /**
     * @param _publicSignals The public signals of the report identity proof that can be verified by the prover
     * @param _proof The proof that can be verified by the prover
     * @param prover The prover that can verify the public signals and the proof
     */
    constructor(
        _publicSignals: PublicSignals,
        _proof: Groth16Proof,
        prover?: Prover
    ) {
        super(_publicSignals, _proof, prover)
        this.reportNullifier = BigInt(_publicSignals[this.idx.reportNullifier])
        this.fromEpoch =  BigInt(_publicSignals[this.idx.fromEpoch])
        this.stateTreeRoot =  BigInt(_publicSignals[this.idx.stateTreeRoot])
        this.unirepSocialCircuit = UnirepSocialCircuit.reportIdentityProof
    }
}
