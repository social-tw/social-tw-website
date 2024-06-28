import { QueryKeys } from '@/constants/queryKeys'
import { useEpoch } from '@/features/core'
import { useQuery } from '@tanstack/react-query'
import { fetchPendingReports } from '../../utils/apis'

export function usePendingReports() {
    const { currentEpoch } = useEpoch()

    return useQuery({
        queryKey: [QueryKeys.PendingReports, currentEpoch],
        queryFn: fetchPendingReports,
    })
}