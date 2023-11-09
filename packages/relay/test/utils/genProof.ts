import { Identity } from '@semaphore-protocol/identity'
import { IncrementalMerkleTree } from '@unirep/utils'
import { CircuitConfig, Circuit, EpochKeyProof } from '@unirep/circuits'
import { defaultProver as prover } from '@unirep-app/circuits/provers/defaultProver'
import { poseidon1 } from 'poseidon-lite'

const { FIELD_COUNT, SUM_FIELD_COUNT } = CircuitConfig.default

export const randomData = () => [
    ...Array(SUM_FIELD_COUNT)
        .fill(0)
        .map(() => poseidon1([Math.floor(Math.random() * 199191919)])),
    ...Array(FIELD_COUNT - SUM_FIELD_COUNT)
        .fill(0)
        .map(
            () =>
                poseidon1([Math.floor(Math.random() * 199191919)]) %
                BigInt(2) ** BigInt(253)
        ),
]

export async function genEpochKeyProof(config: {
    id: Identity
    tree: IncrementalMerkleTree
    leafIndex: number
    epoch: number
    nonce: number
    attesterId: number | bigint
    chainId: number
    data?: bigint[]
    sigData?: bigint
    revealNonce?: number
}) {
    const {
        id,
        tree,
        leafIndex,
        epoch,
        nonce,
        attesterId,
        chainId,
        data: _data,
        sigData,
        revealNonce,
    } = Object.assign(
        {
            data: [],
        },
        config
    )
    const data = [..._data, ...Array(FIELD_COUNT - _data.length).fill(0)]
    const _proof = tree.createProof(leafIndex)
    const circuitInputs = {
        identity_secret: id.secret,
        state_tree_indices: _proof.pathIndices,
        state_tree_elements: _proof.siblings,
        data,
        sig_data: sigData ?? BigInt(0),
        nonce,
        epoch,
        attester_id: attesterId,
        chain_id: chainId,
        reveal_nonce: revealNonce ?? 0,
    }

    const r = await prover.genProofAndPublicSignals(
        Circuit.epochKey,
        circuitInputs
    )

    const { publicSignals, proof } = new EpochKeyProof(
        r.publicSignals,
        r.proof,
        prover
    )

    return { publicSignals, proof }
}
