import { UserState } from '@unirep/core'
import { toDecString } from '@unirep/core/src/Synchronizer'
import { UnirepSocialCircuit } from '@unirep-app/circuits/dist/src/types'
import { stringifyBigInts } from '@unirep/utils'
import { ReportNonNullifierProof } from '@unirep-app/circuits'

export async function genReportNonNullifierProof(
    userState: UserState,
    params: {
        reportId: string
        reportedEpochKey: bigint
        reportedEpoch: number
        nonce: number
    },
    options: {
        epoch?: number
        attesterId?: bigint | string
    } = {},
) {
    const attesterId = toDecString(
        options.attesterId ?? userState.sync.attesterId,
    )
    const epoch =
        options.epoch ?? (await userState.latestTransitionedEpoch(attesterId))

    const identitySecret = userState.id.secret

    const circuitInputs = {
        reported_epoch_key: params.reportedEpochKey,
        identity_secret: identitySecret,
        reported_epoch: params.reportedEpoch,
        current_epoch: epoch,
        current_nonce: params.nonce,
        attester_id: attesterId,
        chain_id: userState.chainId,
    }

    const results = await userState.prover.genProofAndPublicSignals(
        UnirepSocialCircuit.reportNonNullifierProof,
        stringifyBigInts(circuitInputs),
    )

    return new ReportNonNullifierProof(
        results.publicSignals,
        results.proof,
        userState.prover,
    )
}
