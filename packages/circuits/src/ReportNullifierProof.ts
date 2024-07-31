import { BigNumberish } from '@ethersproject/bignumber';
import { BaseProof, Circuit, Prover } from '@unirep/circuits';
import { Groth16Proof, PublicSignals } from 'snarkjs';
import { decodeEpochKeyControl } from '../test/utils';

/**
 * The ReportNullifierProof structure that helps to query the public signals
 */
export class ReportNullifierProof extends BaseProof {
    /**
     * Index mapping for public signals
     */
    readonly idx = {
        reportNullifier: 0,
        currentEpochKey: 1,
        control: 2,
    };

    /**
     * The nullifier of the report, stored in the relay.
     */
    public reportNullifier: BigNumberish;

    /**
     * The current epoch key, output from the circuit.
     */
    public currentEpochKey: BigNumberish;

    /**
     * The control signal, output from the circuit.
     */
    public control: BigNumberish;

    /**
     * Extracted fields from the control signal
     */
    public nonce: BigNumberish;
    public epoch: BigNumberish;
    public attesterId: BigNumberish;
    public revealNonce: BigNumberish;
    public chainId: BigNumberish;

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
        super(_publicSignals, _proof, prover);
        this.reportNullifier = _publicSignals[this.idx.reportNullifier];
        this.currentEpochKey = _publicSignals[this.idx.currentEpochKey];
        this.control = BigInt(this.publicSignals[this.idx.control])
        
        const { nonce, epoch, attesterId, revealNonce, chainId } = decodeEpochKeyControl(this.control)
        this.nonce = nonce
        this.epoch = epoch
        this.attesterId = attesterId
        this.revealNonce = revealNonce
        this.chainId = chainId
        this.circuit = Circuit.reportNullifierProof;
    }
}
