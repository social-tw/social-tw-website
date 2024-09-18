import { QueryKeys } from '@/constants/queryKeys'
import { useEpoch, useUserState } from '@/features/core'
import { useQuery } from '@tanstack/react-query'

export function useReputationScore() {
    const { userState } = useUserState()

    const { currentEpoch } = useEpoch()

    const reputationScoreQuery = useQuery({
        queryKey: [
            QueryKeys.ReputationScore,
            userState?.id.toString(),
            currentEpoch,
        ],
        queryFn: async () => {
            if (!userState) {
                return 0
            }
            const data = await userState.getData()
            return Number(data[0] - data[1])
        },
    })

    const { data: reputationScore, ...otherProps } = reputationScoreQuery

    const isValidReputationScore =
        reputationScore !== undefined && reputationScore >= 0

    return {
        ...otherProps,
        reputationScore,
        isValidReputationScore,
    }
}
