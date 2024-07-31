import { BigNumberish } from '@ethersproject/bignumber';
import { BaseProof, Prover } from '@unirep/circuits';
import { Groth16Proof, PublicSignals } from 'snarkjs';

/**
 * The ReportNegRepProof structure that helps to query the public signals
 */
export class ReportNegRepProof extends BaseProof {
    /**
     * Index mapping for public signals
     */
    readonly idx = {
        reportedEpochKey: 0,
    };

    /**
     * The reported epoch key, stored in the relayer and used for matching.
     */
    public reportedEpochKey: BigNumberish;

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
        super(_publicSignals, _proof, prover);
        this.reportedEpochKey = _publicSignals[this.idx.reportedEpochKey];
        (this as any).circuit = 'reportNegRepProof';
    }
}
