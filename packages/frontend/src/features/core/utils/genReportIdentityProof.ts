import { ReportIdentityProof } from "@unirep-app/circuits"
import { UserState } from "@unirep/core"
import { toDecString } from "@unirep/core/src/Synchronizer"
import { stringifyBigInts } from '@unirep/utils'
import { poseidon2 } from "poseidon-lite"

export async function genReportNullifier(id: bigint, reportId: string) {
    return poseidon2([id, reportId])
}

export async function genReportIdentityProof(
    userState: UserState,
    params: {
        reportId: string
    },
    options: {
        nonce?: number
        epoch?: number
        data?: bigint
        revealNonce?: boolean
        attesterId?: bigint | string
    } = {},
) {
    const reportId = params.reportId

    const attesterId = toDecString(
        options.attesterId ?? userState.sync.attesterId
    )
    const epoch =
        options.epoch ?? (await userState.latestTransitionedEpoch(attesterId))
    const tree = await userState.sync.genStateTree(epoch, attesterId)
    const leafIndex = await userState.latestStateTreeLeafIndex(epoch, attesterId)
    const data = await userState.getData(epoch - 1, attesterId)
    const proof = tree.createProof(leafIndex)
    const identitySecret = userState.id.secret

    const reportNuillifier = genReportNullifier(identitySecret, reportId)

    const circuitInputs = {
        report_nullifier: reportNuillifier,
        identity_secret: identitySecret,
        hash_user_id: identitySecret,
        report_id: reportId,
        data,
        attester_id: attesterId,
        from_epoch: epoch,
        chain_id: userState.chainId,
        state_tree_indices: proof.pathIndices,
        state_tree_elements: proof.siblings,
        state_tree_root: proof.root,
    }

    const results = await userState.prover.genProofAndPublicSignals(
        'reportIdentityProof',
        stringifyBigInts(circuitInputs)
    )

    return new ReportIdentityProof(
        results.publicSignals,
        results.proof,
        userState.prover
    )
}
