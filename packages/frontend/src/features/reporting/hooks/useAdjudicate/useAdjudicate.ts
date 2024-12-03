import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    failActionById,
    ReportService,
    succeedActionById,
    useUserState,
    useUserStateTransition,
} from '@/features/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AdjudicateFormValues } from '../../components/Adjudicate/AdjudicateForm'
import NotificationService from '@/features/notification/services/NotificationService'

export function useAdjudicate() {
    const queryClient = useQueryClient()

    const { userState } = useUserState()

    const { stateTransition } = useUserStateTransition()

    return useMutation({
        mutationKey: [MutationKeys.Adjudicate],
        mutationFn: async (values: AdjudicateFormValues) => {
            if (!userState) {
                return
            }

            await stateTransition()

            const reportService = new ReportService(userState)
            await reportService.adjudicateReport(values)
        },
        onMutate: async (variables) => {
            const actionId = addAction(ActionType.Adjudicate, variables)
            return { actionId }
        },
        onError: (_error, _variables, context) => {
            if (context?.actionId) {
                failActionById(context.actionId)
            }
            NotificationService.sendNotification(
                'ADJUDICATE_FAILED',
                context?.actionId,
            )
        },
        onSuccess: async (_data, _variables, context) => {
            if (context?.actionId) {
                succeedActionById(context.actionId)
            }

            await queryClient.invalidateQueries({
                queryKey: [QueryKeys.PendingReports],
            })
            NotificationService.sendNotification('ADJUDICATE_SUCCEEDED')
        },
    })
}
