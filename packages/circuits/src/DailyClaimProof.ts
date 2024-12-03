import { BaseProof, Circuit, Prover } from '@unirep/circuits'
import { Groth16Proof } from 'snarkjs'
import { UnirepSocialCircuit } from './types'

/**
 * Verify the voter identity for voting the report
 */
export class DailyClaimProof extends BaseProof {
    readonly input = {
        dailyEpoch: 0,
        dailyNullifier: 1,
        attesterId: 2,
        epoch: 3,
    }

    public dailyNullifier: bigint
    public attesterId: bigint
    public epoch: bigint

    constructor(
        publicSignals: (bigint | string)[],
        proof: Groth16Proof,
        prover?: Prover
    ) {
        super(publicSignals, proof, prover)
        this.dailyNullifier = BigInt(publicSignals[this.input.dailyNullifier])
        this.epoch = BigInt(publicSignals[this.input.epoch])
        this.attesterId = BigInt(this.publicSignals[this.input.attesterId])
        this.circuit = UnirepSocialCircuit.dailyClaimProof as any as Circuit
    }
}
