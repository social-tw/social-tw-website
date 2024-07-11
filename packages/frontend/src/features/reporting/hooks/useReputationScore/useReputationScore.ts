import { QueryKeys } from '@/constants/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useReputationScore() {
    return useQuery({
        queryKey: [QueryKeys.ReputationScore],
        queryFn: async () => {
            return -1
        },
    })
}
