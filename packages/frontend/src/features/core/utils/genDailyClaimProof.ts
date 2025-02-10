import { DailyClaimProof } from '@unirep-app/circuits'
import { UserState } from '@unirep/core'
import { toDecString } from '@unirep/core/src/Synchronizer'
import { stringifyBigInts } from '@unirep/utils'
import { poseidon2 } from 'poseidon-lite'

export function genDailyClaimNullifier(idSecret: bigint, dailyEpoch: string) {
    return poseidon2([idSecret, dailyEpoch])
}

export async function genDailyClaimProof(
    userState: UserState,
    params: {
        dailyEpoch: string,
        graffiti?: bigint | string,
        revealNonce?: boolean,
        epkNonce?: number,
        minRep?: number | bigint | string,
        maxRep?: number | bigint | string,
        proveZeroRep?: boolean,
    },
    options: {
        epoch?: number
        attesterId?: bigint | string
    } = {},
) {
    const chainId = userState.chainId
    const attesterId = toDecString(
        options.attesterId ?? userState.sync.attesterId,
    )
    const epoch =
        options.epoch ?? (await userState.latestTransitionedEpoch(attesterId))
    const tree = await userState.sync.genStateTree(epoch, attesterId)
    const leafIndex = await userState.latestStateTreeLeafIndex(
        epoch,
        attesterId,
    )
    const data = await userState.getData(epoch - 1, attesterId)
    const proof = tree.createProof(leafIndex)
    const identitySecret = userState.id.secret

    const dailyNullifier = genDailyClaimNullifier(identitySecret, params.dailyEpoch)

    const circuitInputs = {
        identity_secret: identitySecret,
        daily_epoch: params.dailyEpoch,
        daily_nullifier: dailyNullifier,
        state_tree_indices: proof.pathIndices,
        state_tree_elements: proof.siblings,
        data,
        prove_graffiti: params.graffiti ? 1 : 0,
        graffiti: BigInt(params.graffiti ?? 0),
        reveal_nonce: params.revealNonce ?? 0,
        attester_id: attesterId,
        epoch: epoch,
        nonce: params.epkNonce,
        chain_id: chainId,
        sig_data: BigInt(0),
        min_rep: params.minRep ?? 0,
        max_rep: params.maxRep ?? 0,
        prove_min_rep: !!(params.minRep ?? 0) ? 1 : 0,
        prove_max_rep: !!(params.maxRep ?? 0) ? 1 : 0,
        prove_zero_rep: params.proveZeroRep ?? 0,
    }

    const results = await userState.prover.genProofAndPublicSignals(
        'dailyClaimProof',
        stringifyBigInts(circuitInputs),
    )

    return new DailyClaimProof(
        results.publicSignals,
        results.proof,
        userState.prover,
    )
}
