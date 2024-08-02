import { Identity } from '@semaphore-protocol/identity'
import { defaultProver as prover } from '@unirep-app/circuits/provers/defaultProver'
import { Circuit, CircuitConfig, EpochKeyProof } from '@unirep/circuits'
import {
    IncrementalMerkleTree,
    genStateTreeLeaf,
    stringifyBigInts,
} from '@unirep/utils'
import { ethers } from 'hardhat'
import { poseidon1 } from 'poseidon-lite'
import Prover from '../../src/services/utils/Prover'

const { FIELD_COUNT, SUM_FIELD_COUNT, STATE_TREE_DEPTH } = CircuitConfig.default

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
    chainId: number
    attesterId: number | bigint
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
        chainId,
        attesterId,
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
        state_tree_elements: _proof.siblings,
        state_tree_indices: _proof.pathIndices,
        identity_secret: id.secret,
        data,
        sig_data: sigData ?? BigInt(0),
        nonce,
        epoch,
        chain_id: chainId,
        attester_id: attesterId,
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

export enum ReputationType {
    POSITIVE,
    NEGATIVE,
}

const genReputationCircuitInput = (config: {
    id: Identity
    epoch: number
    nonce: number
    attesterId: number | bigint
    startBalance?: (bigint | number)[]
    minRep?: number | bigint
    maxRep?: number | bigint
    proveMinRep?: number
    proveMaxRep?: number
    proveZeroRep?: number
    proveGraffiti?: boolean | number
    graffiti?: any
    revealNonce?: number
    chainId: number
}) => {
    const {
        id,
        epoch,
        nonce,
        attesterId,
        startBalance: _startBalance,
        minRep,
        proveGraffiti,
        graffiti,
        maxRep,
        proveMinRep,
        proveMaxRep,
        proveZeroRep,
        revealNonce,
        chainId,
    } = Object.assign(
        {
            minRep: 0,
            maxRep: 0,
            graffiti: 0,
            startBalance: [],
        },
        config
    )

    const startBalance = [
        ..._startBalance,
        ...Array(FIELD_COUNT - _startBalance.length).fill(0),
    ]
    // Global state tree
    const stateTree = new IncrementalMerkleTree(STATE_TREE_DEPTH)
    const hashedLeaf = genStateTreeLeaf(
        id.secret,
        BigInt(attesterId),
        epoch,
        startBalance as any,
        chainId ?? 0
    )
    stateTree.insert(hashedLeaf)
    const stateTreeProof = stateTree.createProof(0) // if there is only one GST leaf, the index is 0

    const circuitInputs = {
        identity_secret: id.secret,
        state_tree_indices: stateTreeProof.pathIndices,
        state_tree_elements: stateTreeProof.siblings,
        data: startBalance,
        graffiti: graffiti,
        epoch,
        nonce,
        attester_id: attesterId,
        prove_graffiti: proveGraffiti ? proveGraffiti : 0,
        min_rep: minRep,
        max_rep: maxRep,
        prove_max_rep: proveMaxRep ?? 0,
        prove_min_rep: proveMinRep ?? 0,
        prove_zero_rep: proveZeroRep ?? 0,
        reveal_nonce: revealNonce ?? 0,
        sig_data: 0,
        chain_id: chainId,
    }
    return stringifyBigInts(circuitInputs)
}

export async function genProofAndVerify(
    circuit: string | Circuit,
    circuitInputs: any
) {
    const startTime = new Date().getTime()
    const { proof, publicSignals } = await Prover.genProofAndPublicSignals(
        circuit,
        circuitInputs
    )
    const endTime = new Date().getTime()
    console.log(
        `Gen Proof time: ${endTime - startTime} ms (${Math.floor(
            (endTime - startTime) / 1000
        )} s)`
    )
    const isValid = await Prover.verifyProof(circuit, publicSignals, proof)
    return { isValid, proof, publicSignals }
}

export async function genProveReputationProof(type, config) {
    if (type == ReputationType.POSITIVE) {
        const minRep = 2
        const proveMinRep = 1
        const startBalance = [5, 1]
        const circuitInputs = genReputationCircuitInput({
            ...config,
            startBalance,
            minRep,
            proveMinRep,
        })
        const { isValid, publicSignals, proof } = await genProofAndVerify(
            Circuit.reputation,
            circuitInputs
        )

        return {
            publicSignals,
            proof,
        }
    } else {
        const maxRep = 4
        const proveMaxRep = 1
        const startBalance = [5, 10]
        const circuitInputs = genReputationCircuitInput({
            ...config,
            startBalance,
            maxRep,
            proveMaxRep,
        })
        const { isValid, publicSignals, proof } = await genProofAndVerify(
            Circuit.reputation,
            circuitInputs
        )

        return {
            publicSignals,
            proof,
        }
    }
}

export async function userStateTransition(userState, context) {
    const sync = userState.sync

    const epoch = await sync.loadCurrentEpoch()
    const attesterId = sync.attesterId
    const remainingTime = await context.unirep.attesterEpochRemainingTime(
        attesterId
    )
    // epoch transition
    await ethers.provider.send('evm_increaseTime', [remainingTime])
    await ethers.provider.send('evm_mine', [])
    const toEpoch = epoch + 1

    const { publicSignals, _snarkProof: proof } =
        await userState.genUserStateTransitionProof({
            toEpoch,
        })
    const txHash = await context.express
        .post(`/api/transition`)
        .set('content-type', 'application/json')
        .send(
            stringifyBigInts({
                publicSignals,
                proof,
            })
        )
        .then((res) => {
            return res.body.txHash
        })
    await ethers.provider.waitForTransaction(txHash)
    await sync.waitForSync()

    return toEpoch
}

export async function genReportIdentityProof(userState, config) {
    const identitySecret = userState.id.secret
    const sync = userState.sync
    const attesterId = sync.attesterId
    const toEpoch = config.toEpoch

    const data = await userState.getData(toEpoch, attesterId)
    const stateTree = await sync.genStateTree(toEpoch, attesterId)
    const leafIndex = await userState.latestStateTreeLeafIndex(
        toEpoch,
        attesterId
    )
    const stateTreeProof = stateTree.createProof(leafIndex)

    const circuitInput = {
        report_nullifier: config.nullifier,
        identity_secret: identitySecret,
        hash_user_id: config.hashUserId,
        report_id: config.reportId,
        data,
        attester_id: attesterId,
        from_epoch: toEpoch,
        chain_id: config.chainId,
        state_tree_indices: stateTreeProof.pathIndices,
        state_tree_elements: stateTreeProof.siblings,
        state_tree_root: stateTreeProof.root,
    }

    const { isValid, proof, publicSignals } = await genProofAndVerify(
        'reportIdentityProof',
        stringifyBigInts(circuitInput)
    )
    return {
        proof,
        publicSignals,
    }
}
