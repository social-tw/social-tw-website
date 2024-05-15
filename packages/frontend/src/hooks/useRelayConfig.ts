import { fetchRelayConfig } from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export default function useRelayConfig() {
    return useQuery({
        queryKey: ['relayConfig'],
        queryFn: fetchRelayConfig,
    })
}
