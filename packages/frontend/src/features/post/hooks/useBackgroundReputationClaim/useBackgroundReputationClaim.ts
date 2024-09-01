import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUserState } from '@/features/core'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    fetchReportsWaitingForTransaction,
    relayClaimReputation,
} from '@/utils/api'
import { RepUserType, ReputationType } from '@/types/Report'
import { useEffect, useCallback } from 'react'
import {
    flattenProof,
    genProofAndVerify,
    genReportNonNullifierCircuitInput,
    genReportNullifierCircuitInput,
} from '@unirep-app/contracts/test/utils'
import { genNullifier } from '@unirep-app/circuits/test/utils'
import { UnirepSocialCircuit } from '@unirep-app/circuits/dist/src/types'
import { ReportHistory } from '@/features/reporting/utils/types'
import { UserState } from '@unirep/core'

type ClaimReputationParams = {
    report: ReportHistory
    repUserType: RepUserType
}

const REFETCH_INTERVAL = 60000

export function useBackgroundReputationClaim() {
    const queryClient = useQueryClient()
    const { getGuaranteedUserState } = useUserState()

    const { data: reportsWaitingForTransaction, refetch: refetchReports } =
        useQuery({
            queryKey: [QueryKeys.ReportsWaitingForTransaction],
            queryFn: fetchReportsWaitingForTransaction,
            refetchInterval: REFETCH_INTERVAL,
        })

    const generateProof = useCallback(
        async (
            userState: UserState,
            report: ReportHistory,
            repUserType: RepUserType,
        ) => {
            const epochKeyProof = await userState.genEpochKeyProof()
            const currentEpoch = epochKeyProof.epoch
            const currentNonce = epochKeyProof.nonce
            const attesterId = epochKeyProof.attesterId
            const chainId = userState.chainId
            const identitySecret = userState.id.secret

            if (repUserType === RepUserType.VOTER) {
                const reportNullifier = genNullifier(
                    userState.id,
                    Number(report.reportId),
                )
                const reportNullifierCircuitInputs =
                    genReportNullifierCircuitInput({
                        reportNullifier,
                        identitySecret,
                        reportId: 1,
                        currentEpoch,
                        currentNonce,
                        attesterId,
                        chainId,
                    })
                return genProofAndVerify(
                    UnirepSocialCircuit.reportNullifierProof,
                    reportNullifierCircuitInputs,
                )
            } else {
                const reporterEpochKey =
                    repUserType === RepUserType.REPORTER
                        ? report.reportorEpochKey
                        : report.respondentEpochKey
                const reportNonNullifierCircuitInput =
                    genReportNonNullifierCircuitInput({
                        reportedEpochKey: reporterEpochKey,
                        identitySecret,
                        reportedEpoch: 0,
                        currentEpoch,
                        currentNonce,
                        chainId,
                        attesterId,
                    })
                return genProofAndVerify(
                    UnirepSocialCircuit.reportNonNullifierProof,
                    reportNonNullifierCircuitInput,
                )
            }
        },
        [],
    )

    const claimReputation = useMutation({
        mutationKey: [MutationKeys.ClaimReputation],
        mutationFn: async ({ report, repUserType }: ClaimReputationParams) => {
            const userState = await getGuaranteedUserState()
            const { publicSignals, proof } = await generateProof(
                userState,
                report,
                repUserType,
            )

            const result = await relayClaimReputation(
                report.reportId,
                repUserType,
                publicSignals,
                flattenProof(proof),
            )
            await userState.waitForSync()

            return {
                ...result,
                epoch: userState.sync.calcCurrentEpoch(),
                epochKey: userState.getEpochKeys(),
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ReputationHistory],
            })
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ReportHistory, data.reportId],
            })
            refetchReports()
        },
    })

    const claimReputationInBackground = useCallback(
        async (report: ReportHistory, repUserType: RepUserType) => {
            try {
                await claimReputation.mutateAsync({ report, repUserType })
            } catch (error) {
                console.error(
                    'Failed to claim reputation in background:',
                    error,
                )
            }
        },
        [claimReputation],
    )

    useEffect(() => {
        const processReports = async () => {
            if (!reportsWaitingForTransaction) return

            const userState = await getGuaranteedUserState()

            for (const report of reportsWaitingForTransaction) {
                const epoch = report.reportEpoch
                const epochKeyLiteProof = await userState.genEpochKeyLiteProof({
                    epoch: epoch,
                })
                const currentEpochKey = epochKeyLiteProof.epochKey.toString()
                if (
                    report.reportorEpochKey === currentEpochKey &&
                    !report.reportorClaimedRep
                ) {
                    await claimReputationInBackground(
                        report,
                        RepUserType.REPORTER,
                    )
                } else if (
                    report.respondentEpochKey === currentEpochKey &&
                    !report.respondentClaimedRep
                ) {
                    await claimReputationInBackground(
                        report,
                        RepUserType.POSTER,
                    )
                } else if (
                    report.adjudicatorsNullifier?.some(
                        (adj) =>
                            adj.nullifier === currentEpochKey && !adj.claimed,
                    ) ??
                    false
                ) {
                    await claimReputationInBackground(report, RepUserType.VOTER)
                }
            }
        }

        processReports()
    }, [
        claimReputationInBackground,
        getGuaranteedUserState,
        reportsWaitingForTransaction,
    ])

    return {
        claimReputationInBackground,
        isClaimingReputation: claimReputation.isPending,
        claimReputationError: claimReputation.error,
    }
}
