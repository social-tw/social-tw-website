import { UserState } from '@unirep/core'
import { toDecString } from '@unirep/core/src/Synchronizer'
import { genReportNullifier } from '@/features/core'
import { UnirepSocialCircuit } from '@unirep-app/circuits/dist/src/types'
import { stringifyBigInts } from '@unirep/utils'
import { ReportNullifierProof } from '@unirep-app/circuits'

export async function genReportNullifierProof(
    userState: UserState,
    params: {
        reportId: string
        nonce: number
    },
    options: {
        epoch?: number
        attesterId?: bigint | string
    } = {},
) {
    const reportId = params.reportId

    const attesterId = toDecString(
        options.attesterId ?? userState.sync.attesterId,
    )
    const epoch =
        options.epoch ?? (await userState.latestTransitionedEpoch(attesterId))

    const identitySecret = userState.id.secret

    const reportNullifier = genReportNullifier(identitySecret, reportId)

    const circuitInputs = {
        report_nullifier: reportNullifier,
        identity_secret: identitySecret,
        report_id: reportId,
        current_epoch: epoch,
        current_nonce: params.nonce,
        attester_id: attesterId,
        chain_id: userState.chainId,
    }

    const results = await userState.prover.genProofAndPublicSignals(
        UnirepSocialCircuit.reportNullifierProof,
        stringifyBigInts(circuitInputs),
    )

    return new ReportNullifierProof(
        results.publicSignals,
        results.proof,
        userState.prover,
    )
}
