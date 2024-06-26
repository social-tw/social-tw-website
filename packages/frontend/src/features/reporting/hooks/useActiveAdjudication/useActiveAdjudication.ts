import { QueryKeys } from '@/constants/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { fetchAllReports } from '../../utils/apis'

export function useActiveAdjudication() {
    const { data } = useQuery({
        queryKey: [QueryKeys.ManyReports],
        queryFn: fetchAllReports,
    })

    // TODO: filter reports whose reportorEpochKey is not mine
    // TODO: filter reports whose respondentEpochKey is not mine
    // TODO: filter reports on which user have not decided yet
    const unresolvedReports = data ?? []

    const activeReport =
        unresolvedReports.length === 0 ? null : unresolvedReports[0]

    return activeReport
}
