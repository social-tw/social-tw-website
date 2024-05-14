import { fetchRelayConfig } from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export default function useRelayConfig() {
    const { data } = useQuery({
        queryKey: ['relayConfig'],
        queryFn: fetchRelayConfig,
    })

    return data
}