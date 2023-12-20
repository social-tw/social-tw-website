'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.DataProof = void 0
const circuits_1 = require('@unirep/circuits')
/**
 * The data proof structure that helps to query the public signals
 */
class DataProof extends circuits_1.BaseProof {
    /**
     * @param _publicSignals The public signals of the data proof that can be verified by the prover
     * @param _proof The proof that can be verified by the prover
     * @param prover The prover that can verify the public signals and the proof
     */
    constructor(_publicSignals, _proof, prover) {
        super(_publicSignals, _proof, prover)
        this.idx = {
            stateTreeRoot: 0,
            value: [1, 5],
        }
        this.stateTreeRoot = _publicSignals[this.idx.stateTreeRoot]
        this.value = []
        for (let i = this.idx.value[0]; i < this.idx.value[1]; i++) {
            this.value.push(_publicSignals[i])
        }
        this.circuit = 'dataProof'
    }
}
exports.DataProof = DataProof
