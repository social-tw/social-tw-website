import { BaseProof, Circuit, Prover } from '@unirep/circuits'
import { Groth16Proof } from 'snarkjs'
import { UnirepSocialCircuit } from './types'

/**
 * Verify the voter identity for voting the report
 */
export class DailyClaimProof extends BaseProof {
    readonly input = {
        identitySecret: 0,
        dailyEpoch: 1,
        dailyNullifier: 2,
        stateTreeIndices: 3,
        stateTreeElements: 4,
        data: 5,
        proveGraffiti: 6,
        graffiti: 7,
        revealNonce: 8,
        attesterId: 9,
        epoch: 10,
        nonce: 11,
        chainId: 12,
        sigData: 13,
        minRep: 14,
        maxRep: 15,
        proveMinRep: 16,
        proveMaxRep: 17,
        proveZeroRep: 18,
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
