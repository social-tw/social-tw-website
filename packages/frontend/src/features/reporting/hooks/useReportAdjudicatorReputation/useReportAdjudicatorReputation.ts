import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    useActionCount,
    useUserState,
    useUserStateTransition,
    useWeb3Provider,
} from '@/features/core'
import { genReportNullifierProof } from '@/features/core/utils/genReportNullifierProof'
import { useSendNotification } from '@/features/notification/stores/useNotificationStore'
import { NotificationType } from '@/types/Notifications'
import { RepUserType, ReputationType } from '@/types/Report'
import { relayClaimReputation } from '@/utils/api'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useReportAdjudicatorReputation() {
    const { stateTransition } = useUserStateTransition()
    const { getGuaranteedUserState } = useUserState()
    const actionCount = useActionCount()
    const { getGuaranteedProvider } = useWeb3Provider()
    const queryClient = useQueryClient()
    const sendNotification = useSendNotification()

    return useMutation({
        mutationKey: [MutationKeys.ClaimAdjudicatorReputation],
        mutationFn: async (reportId: string) => {
            await stateTransition()
            const userState = await getGuaranteedUserState()
            const nonce = getEpochKeyNonce(actionCount)
            const { publicSignals, proof } = await genReportNullifierProof(
                userState,
                { reportId, nonce: nonce },
            )
            const result = await relayClaimReputation(
                reportId,
                RepUserType.ADJUDICATOR,
                publicSignals,
                proof,
            )
            const provider = getGuaranteedProvider()
            await provider.waitForTransaction(result.message.txHash)
            await userState.waitForSync()

            return result
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ReputationScore],
            })
            const reportId = result.message.reportId
            const isPassed = result.message.isPassed
            switch (result.message.type) {
                case ReputationType.BE_REPORTED:
                    sendNotification(NotificationType.BE_REPORTED, reportId)
                    break
                case ReputationType.REPORT_SUCCESS:
                    sendNotification(NotificationType.REPORT_PASSED, reportId)
                    break
                case ReputationType.REPORT_FAILURE:
                    sendNotification(NotificationType.REPORT_REJECTED, reportId)
                    break
                case ReputationType.ADJUDICATE:
                    sendNotification(
                        isPassed
                            ? NotificationType.ADJUDICATE_RESULT_PASSED
                            : NotificationType.ADJUDICATE_RESULT_REJECTED,
                        reportId,
                    )
                    break
            }
        },
    })
}
