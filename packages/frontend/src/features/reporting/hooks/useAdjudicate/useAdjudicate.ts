import { MutationKeys } from '@/constants/queryKeys'
import {
    ReportService,
    useUserState,
    useUserStateTransition,
} from '@/features/core'
import { useMutation } from '@tanstack/react-query'
import { AdjudicateFormValues } from '../../components/Adjudicate/AdjudicateForm'

export function useAdjudicate() {
    const { getGuaranteedUserState } = useUserState()

    const { stateTransition } = useUserStateTransition()

    return useMutation({
        mutationKey: [MutationKeys.Adjudicate],
        mutationFn: async (values: AdjudicateFormValues) => {
            await stateTransition()
            const userState = await getGuaranteedUserState()
            const reportService = new ReportService(userState)
            return reportService.adjudicateReport(values)
        },
    })
}
