import { Prover } from '@unirep/circuits'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import { UnirepSocialCircuit } from '../test/types'
import { decodeEpochKeyControl } from '../test/utils'
import { UnirepSocialBaseProof } from './UnirepSocialBaseProof'

/**
 *  Verify the voter identity for claiming reputation
 */
export class ReportNullifierProof extends UnirepSocialBaseProof {
    /**
     * Index mapping for public signals
     */
    readonly idx = {
        reportNullifier: 0,
        currentEpochKey: 1,
        control: 2,
    }

    /**
     * The nullifier of the report, stored in the relay.
     */
    public reportNullifier: bigint

    /**
     * The current epoch key, output from the circuit.
     */
    public currentEpochKey: bigint

    /**
     * The control signal, output from the circuit.
     */
    public control: bigint

    /**
     * Extracted fields from the control signal
     */
    public nonce: bigint
    public epoch: bigint
    public attesterId: bigint
    public revealNonce: bigint
    public chainId: bigint

    /**
     * @param _publicSignals The public signals of the report nullifier proof that can be verified by the prover
     * @param _proof The proof that can be verified by the prover
     * @param prover The prover that can verify the public signals and the proof
     */
    constructor(
        _publicSignals: PublicSignals,
        _proof: Groth16Proof,
        prover?: Prover
    ) {
        super(_publicSignals, _proof, prover)
        this.reportNullifier = BigInt(_publicSignals[this.idx.reportNullifier])
        this.currentEpochKey = BigInt(_publicSignals[this.idx.currentEpochKey])
        this.control = BigInt(this.publicSignals[this.idx.control])
        
        const { nonce, epoch, attesterId, revealNonce, chainId } = decodeEpochKeyControl(this.control)
        this.nonce = nonce
        this.epoch = epoch
        this.attesterId = attesterId
        this.revealNonce = revealNonce
        this.chainId = chainId
        this.unirepSocialCircuit = UnirepSocialCircuit.reportNullifierProof
    }
}
