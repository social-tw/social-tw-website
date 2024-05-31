import * as snarkjs from 'snarkjs'
import type { CircuitSignals, PublicSignals, Groth16Proof } from 'snarkjs'
import { Circuit } from '@unirep/circuits'
import { KEY_SERVER } from '../constants/config'

const prover = {
    verifyProof: async (
        circuitName: string | Circuit,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
    ) => {
        const url = new URL(`/build/${circuitName}.vkey.json`, KEY_SERVER)
        const vkey = await fetch(url.toString()).then((r) => r.json())
        return snarkjs.groth16.verify(vkey, publicSignals, proof)
    },
    genProofAndPublicSignals: async (
        circuitName: string | Circuit,
        inputs: CircuitSignals,
    ) => {
        const wasmUrl = new URL(`${circuitName}.wasm`, KEY_SERVER)

        const wasm = await fetch(wasmUrl.toString()).then((r) =>
            r.arrayBuffer(),
        )
        const zkeyUrl = new URL(`${circuitName}.zkey`, KEY_SERVER)
        const zkey = await fetch(zkeyUrl.toString()).then((r) =>
            r.arrayBuffer(),
        )
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            inputs,
            new Uint8Array(wasm),
            new Uint8Array(zkey),
        )
        return { proof, publicSignals }
    },
    /**
     * Get vkey from default built folder `zksnarkBuild/`
     * @param name Name of the circuit, which can be chosen from `Circuit`
     * @returns vkey of the circuit
     */
    getVKey: async (_name: string | Circuit) => {
        // return require(path.join(buildPath, `${_name}.vkey.json`))
    },
}

export default prover
