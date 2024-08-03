import { QueryKeys } from '@/constants/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useReputationScore() {
    const { data: reputationScore } = useQuery({
        queryKey: [QueryKeys.ReputationScore],
        queryFn: async () => {
            return 10
        },
    })

    return {
        reputationScore,
    }
}
