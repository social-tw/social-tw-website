import {
    BaseProof,
    Circuit,
    decodeEpochKeyControl,
    decodeReputationControl,
    Prover,
} from '@unirep/circuits'
import { Groth16Proof } from 'snarkjs'
import { UnirepSocialCircuit } from './types'

/**
 * Verify the voter identity for voting the report
 */
export class DailyClaimProof extends BaseProof {
    readonly input = {
        epochKey: 0,
        control0: 1,
        control1: 2,
        dailyEpoch: 3,
        dailyNullifier: 4,
    }

    public epochKey: bigint
    public control0: bigint
    public control1: bigint
    public dailyEpoch: bigint
    public dailyNullifier: bigint
    public nonce: bigint
    public epoch: bigint
    public attesterId: bigint
    public revealNonce: bigint
    public chainId: bigint
    public minRep: bigint
    public maxRep: bigint
    public proveMinRep: bigint
    public proveMaxRep: bigint
    public proveZeroRep: bigint
    public proveGraffiti: bigint

    constructor(
        publicSignals: (bigint | string)[],
        proof: Groth16Proof,
        prover?: Prover
    ) {
        super(publicSignals, proof, prover)
        this.epochKey = BigInt(publicSignals[this.input.epochKey])
        this.control0 = BigInt(publicSignals[this.input.control0])
        this.control1 = BigInt(publicSignals[this.input.control1])
        this.dailyEpoch = BigInt(publicSignals[this.input.dailyEpoch])
        this.dailyNullifier = BigInt(publicSignals[this.input.dailyNullifier])
        const { nonce, epoch, attesterId, revealNonce, chainId } =
            decodeEpochKeyControl(this.control0)
        this.nonce = nonce
        this.epoch = epoch
        this.attesterId = attesterId
        this.revealNonce = revealNonce
        this.chainId = chainId
        const {
            minRep,
            maxRep,
            proveMinRep,
            proveMaxRep,
            proveZeroRep,
            proveGraffiti,
        } = decodeReputationControl(this.control1)
        this.minRep = minRep
        this.maxRep = maxRep
        this.proveMinRep = proveMinRep
        this.proveMaxRep = proveMaxRep
        this.proveZeroRep = proveZeroRep
        this.proveGraffiti = proveGraffiti
        this.circuit = UnirepSocialCircuit.dailyClaimProof as any as Circuit
    }
}
