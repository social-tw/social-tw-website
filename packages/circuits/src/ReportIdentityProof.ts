import { BaseProof, Prover } from '@unirep/circuits'
import { Groth16Proof } from 'snarkjs'

export class ReportIdentityProof extends BaseProof {
    readonly idx = {
        reportNullifier: 0,
        attesterId: 1,
        epoch: 2,
        stateTreeRoot: 3,
    }

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
        this.reportNullifier = this.publicSignals[this.idx.reportNullifier]
        this.attesterId = this.publicSignals[this.idx.attesterId]
        this.epoch = this.publicSignals[this.idx.epoch]
        this.stateTreeRoot = this.publicSignals[this.idx.stateTreeRoot]
        ;(this as any).circuit = 'reportIdentityProof'
    }
}
