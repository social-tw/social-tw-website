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
        minRep: 4,
        maxRep: 5
    }

    public dailyEpoch: bigint
    public dailyNullifier: bigint
    public attesterId: bigint
    public epoch: bigint
    public minRep: bigint
    public maxRep: bigint

    constructor(
        publicSignals: (bigint | string)[],
        proof: Groth16Proof,
        prover?: Prover
    ) {
        super(publicSignals, proof, prover)
        this.dailyEpoch = BigInt(publicSignals[this.input.dailyEpoch])
        this.dailyNullifier = BigInt(publicSignals[this.input.dailyNullifier])
        this.epoch = BigInt(publicSignals[this.input.epoch])
        this.attesterId = BigInt(this.publicSignals[this.input.attesterId])
        this.minRep = BigInt(this.publicSignals[this.input.minRep])
        this.maxRep = BigInt(this.publicSignals[this.input.maxRep])
        this.circuit = UnirepSocialCircuit.dailyClaimProof as any as Circuit
    }
}
