import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUserState } from '@/features/core'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    relayClaimPositiveReputation,
    relayClaimNegativeReputation,
} from '@/utils/api'
import { RepUserType, ReputationType } from '@/types/Report'

export function useBackgroundReputationClaim() {
    const queryClient = useQueryClient()
    const { getGuaranteedUserState } = useUserState()

    const claimReputation = useMutation({
        mutationKey: [MutationKeys.ClaimReputation],
        mutationFn: async ({
            reportId,
            repUserType,
            isPositive,
            nullifier,
        }: {
            reportId: string
            repUserType: RepUserType
            isPositive: boolean
            nullifier?: string
        }) => {
            const userState = await getGuaranteedUserState()
            const epochKeyProof = await userState.genEpochKeyLiteProof()

            let result
            if (isPositive) {
                result = await relayClaimPositiveReputation(
                    epochKeyProof,
                    reportId,
                    repUserType,
                    nullifier,
                )
            } else {
                result = await relayClaimNegativeReputation(
                    epochKeyProof,
                    reportId,
                    repUserType,
                )
            }

            await userState.waitForSync()

            return {
                txHash: result.txHash,
                reportId,
                epoch: epochKeyProof.epoch,
                epochKey: epochKeyProof.epochKey.toString(),
                type: isPositive
                    ? ReputationType.REPORT_SUCCESS
                    : ReputationType.REPORT_FAILURE,
                score: result.score, // Assuming the API returns the score
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ReputationHistory],
            })
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ReportHistory, data.reportId],
            })
        },
    })

    const claimReputationInBackground = async (
        reportId: string,
        repUserType: RepUserType,
        isPositive: boolean,
        nullifier?: string,
    ) => {
        try {
            await claimReputation.mutateAsync({
                reportId,
                repUserType,
                isPositive,
                nullifier,
            })
        } catch (error) {
            console.error('Failed to claim reputation in background:', error)
        }
    }

    return {
        claimReputationInBackground,
        isClaimingReputation: claimReputation.isPending,
        claimReputationError: claimReputation.error,
    }
}
