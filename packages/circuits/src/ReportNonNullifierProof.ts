import { Prover } from '@unirep/circuits'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import { UnirepSocialCircuit } from '../test/types'
import { decodeEpochKeyControl } from '../test/utils'
import { UnirepSocialBaseProof } from './UnirepSocialBaseProof'

/**
 *  Verify the reporter / poster identity for claiming reputation
 */
export class ReportNonNullifierProof extends UnirepSocialBaseProof {
    readonly output = {
        control: 0,
        currentEpochKey: 1,
    }

    readonly input = {
        reportedEpochKey: 2,
    }

    public reportedEpochKey: bigint

    public currentEpochKey: bigint
    public control: bigint

    public nonce: bigint
    public epoch: bigint
    public attesterId: bigint
    public revealNonce: bigint
    public chainId: bigint

    constructor(
        _publicSignals: PublicSignals,
        _proof: Groth16Proof,
        prover?: Prover
    ) {
        super(_publicSignals, _proof, prover)
        this.reportedEpochKey = BigInt(
            _publicSignals[this.input.reportedEpochKey]
        )
        this.currentEpochKey = BigInt(
            _publicSignals[this.output.currentEpochKey]
        )
        this.control = BigInt(this.publicSignals[this.output.control])

        const { nonce, epoch, attesterId, revealNonce, chainId } =
            decodeEpochKeyControl(this.control)
        this.nonce = nonce
        this.epoch = epoch
        this.attesterId = attesterId
        this.revealNonce = revealNonce
        this.chainId = chainId
        this.unirepSocialCircuit = UnirepSocialCircuit.reportNonNullifierProof
    }
}
