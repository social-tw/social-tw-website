import { QueryKeys } from '@/constants/queryKeys'
import { ReportService, useEpoch, useUserState } from '@/features/core'
import { useQuery } from '@tanstack/react-query'

export function usePendingReports() {
    const { getGuaranteedUserState } = useUserState()
    const { currentEpoch } = useEpoch()

    return useQuery({
        queryKey: [QueryKeys.PendingReports, currentEpoch],
        queryFn: async () => {
            const userState = await getGuaranteedUserState()
            const reportService = new ReportService(userState)
            return reportService.fetchPendingReports()
        },
    })
}
