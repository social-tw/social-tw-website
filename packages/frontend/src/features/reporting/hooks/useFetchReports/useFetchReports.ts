import { useEpoch } from '@/features/core'
import { useQuery } from '@tanstack/react-query'
import { fetchAllReports } from '../../utils/apis'

export function useFetchReports() {
    const { currentEpoch } = useEpoch()

    return useQuery({
        queryKey: ['reports', currentEpoch],
        queryFn: fetchAllReports,
    })
}
