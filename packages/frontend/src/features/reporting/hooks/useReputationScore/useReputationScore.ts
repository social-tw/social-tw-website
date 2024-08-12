import { QueryKeys } from '@/constants/queryKeys'
import { useUserState } from '@/features/core'
import { useQuery } from '@tanstack/react-query'

export function useReputationScore() {
    const { getGuaranteedUserState } = useUserState()
    const { data: reputationScore } = useQuery({
        queryKey: [QueryKeys.ReputationScore],
        queryFn: async () => {
            const userState = await getGuaranteedUserState()
            const data = await userState.getData()
            return Number(data[0] - data[1])
        },
    })

    const isValidReputationScore =
        reputationScore !== undefined && reputationScore >= 0

    return {
        reputationScore,
        isValidReputationScore,
    }
}
