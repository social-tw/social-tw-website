import { Prover } from '@unirep/circuits'
import { Groth16Proof } from 'snarkjs'
import { UnirepSocialCircuit } from '../test/types'
import { UnirepSocialBaseProof } from './UnirepSocialBaseProof'

/**
 * Verify the voter identity for voting the report
 */
export class ReportIdentityProof extends UnirepSocialBaseProof {
    readonly input = {
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
        this.reportNullifier = this.publicSignals[this.input.reportNullifier]
        this.attesterId = this.publicSignals[this.input.attesterId]
        this.epoch = this.publicSignals[this.input.epoch]
        this.stateTreeRoot = this.publicSignals[this.input.stateTreeRoot]
        this.unirepSocialCircuit = UnirepSocialCircuit.reportIdentityProof
    }
}
