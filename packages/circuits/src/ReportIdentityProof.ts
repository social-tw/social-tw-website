import { BaseProof, Prover } from '@unirep/circuits'
import { Groth16Proof } from 'snarkjs'

/**
 * A class representing an [epoch key proof](https://developer.unirep.io/docs/circuits-api/classes/src.EpochKeyProof). Each of the following properties are public signals for the proof.
 */
export class ReportIdentityProof extends BaseProof {
    public reportNullifier: bigint
    public attesterId: bigint
    public epoch: bigint
    public stateTreeRoot: bigint

    constructor(
        publicSignals: (bigint | string)[],
        proof: Groth16Proof,
        prover?: Prover
    ) {
        super(publicSignals, proof, prover)
        this.reportNullifier = this.publicSignals[0]
        this.attesterId = this.publicSignals[1]
        this.epoch = this.publicSignals[2]
        this.stateTreeRoot = this.publicSignals[3]
        ;(this as any).circuit = 'reportIndentityProof'
    }
}
