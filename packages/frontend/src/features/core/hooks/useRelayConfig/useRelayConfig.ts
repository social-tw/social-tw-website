import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/constants/queryKeys'
import { fetchRelayConfig } from '@/utils/api'

export function useRelayConfig() {
    return useQuery({
        queryKey: [QueryKeys.RelayConfig],
        queryFn: fetchRelayConfig,
        staleTime: Infinity,
    })
}
