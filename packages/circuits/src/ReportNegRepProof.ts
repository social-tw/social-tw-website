import { Prover } from '@unirep/circuits';
import { Groth16Proof, PublicSignals } from 'snarkjs';
import { UnirepSocialCircuit } from '../test/types';
import { UnirepSocialBaseProof } from './UnirepSocialBaseProof';

/**
 *  Verify the reporter / poster identity for claiming reputation
 */
export class ReportNegRepProof extends UnirepSocialBaseProof {
    /**
     * Index mapping for public signals
     */
    readonly idx = {
        reportedEpochKey: 0,
    }

    /**
     * The reported epoch key, stored in the relayer and used for matching.
     */
    public reportedEpochKey: bigint

    /**
     * @param _publicSignals The public signals of the report negative reputation proof that can be verified by the prover
     * @param _proof The proof that can be verified by the prover
     * @param prover The prover that can verify the public signals and the proof
     */
    constructor(
        _publicSignals: PublicSignals,
        _proof: Groth16Proof,
        prover?: Prover
    ) {
        super(_publicSignals, _proof, prover)
        this.reportedEpochKey = BigInt(_publicSignals[this.idx.reportedEpochKey])
        this.unirepSocialCircuit = UnirepSocialCircuit.reportNegRepProof
    }
}
