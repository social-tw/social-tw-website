import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ReportService,
    useUserState,
    useUserStateTransition,
} from '@/features/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AdjudicateFormValues } from '../../components/Adjudicate/AdjudicateForm'

export function useAdjudicate() {
    const { getGuaranteedUserState } = useUserState()

    const { stateTransition } = useUserStateTransition()

    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: [MutationKeys.Adjudicate],
        mutationFn: async (values: AdjudicateFormValues) => {
            await stateTransition()
            const userState = await getGuaranteedUserState()
            const reportService = new ReportService(userState)
            return reportService.adjudicateReport(values)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QueryKeys.PendingReports]
            })
        }
    })
}
