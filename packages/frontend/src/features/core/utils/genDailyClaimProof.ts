import { DailyClaimProof } from '@unirep-app/circuits'
import { ReputationProof } from '@unirep/circuits'
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
        dailyEpoch: string
        reputationProof: ReputationProof
    },
    options: {
        epoch?: number
        attesterId?: bigint | string
    } = {},
) {
    const dailyEpoch = params.dailyEpoch
    const reputationProof = params.reputationProof

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

    const dailyNullifier = genDailyClaimNullifier(identitySecret, dailyEpoch)

    const circuitInputs = {
        identity_secret: identitySecret,
        daily_epoch: dailyEpoch,
        daily_nullifier: dailyNullifier,
        state_tree_indices: proof.pathIndices,
        state_tree_elements: proof.siblings,
        data,
        prove_graffiti: reputationProof.proveGraffiti,
        graffiti: reputationProof.graffiti,
        reveal_nonce: reputationProof.revealNonce,
        attester_id: attesterId,
        epoch: epoch,
        nonce: reputationProof.nonce,
        chain_id: reputationProof.chainId,
        sig_data: BigInt(0),
        min_rep: reputationProof.minRep,
        max_rep: reputationProof.maxRep,
        prove_min_rep: reputationProof.proveMinRep,
        prove_max_rep: reputationProof.proveMaxRep,
        prove_zero_rep: reputationProof.proveZeroRep,
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
