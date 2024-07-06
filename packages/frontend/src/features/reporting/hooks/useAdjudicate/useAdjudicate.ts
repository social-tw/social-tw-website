import { MutationKeys } from '@/constants/queryKeys'
import { useUserState } from '@/features/core'
import { useMutation } from '@tanstack/react-query'
import { AdjudicateFormValues } from '../../components/Adjudicate/AdjudicateForm'
import { adjudicateReport } from '../../utils/apis'
import { getAdjudicateNullifier } from '../../utils/helpers'

export function useAdjudicate() {
    const { getGuaranteedUserState } = useUserState()

    return useMutation({
        mutationKey: [MutationKeys.Adjudicate],
        mutationFn: async (values: AdjudicateFormValues) => {
            const { reportId, adjudicateValue } = values

            const userState = await getGuaranteedUserState()

            const nullifier = getAdjudicateNullifier(
                userState.id.secret,
                reportId,
            )

            return adjudicateReport({
                reportId,
                adjudicateValue,
                nullifier,
            })
        },
    })
}
