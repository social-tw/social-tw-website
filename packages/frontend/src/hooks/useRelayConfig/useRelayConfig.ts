import { QueryKeys } from '@/constants/queryKeys'
import { fetchRelayConfig } from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export function useRelayConfig() {
    return useQuery({
        queryKey: [QueryKeys.RelayConfig],
        queryFn: fetchRelayConfig,
        staleTime: Infinity,
    })
}
