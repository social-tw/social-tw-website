import { BaseProof, Circuit, Prover } from '@unirep/circuits'
import { Groth16Proof } from 'snarkjs'
import { UnirepSocialCircuit } from './types'

/**
 * Verify the voter identity for voting the report
 */
export class ReportIdentityProof extends BaseProof {
    readonly input = {
        reportNullifier: 0,
        reportId: 1,
        attesterId: 2,
        epoch: 3,
        stateTreeRoot: 4,
    }

    public reportNullifier: bigint
    public reportId: bigint
    public attesterId: bigint
    public epoch: bigint
    public stateTreeRoot: bigint

    constructor(
        publicSignals: (bigint | string)[],
        proof: Groth16Proof,
        prover?: Prover
    ) {
        super(publicSignals, proof, prover)
        this.reportNullifier = this.publicSignals[this.input.reportNullifier]
        this.reportId = this.publicSignals[this.input.reportId]
        this.attesterId = this.publicSignals[this.input.attesterId]
        this.epoch = this.publicSignals[this.input.epoch]
        this.stateTreeRoot = this.publicSignals[this.input.stateTreeRoot]
        this.circuit = UnirepSocialCircuit.reportIdentityProof as any as Circuit
    }
}
