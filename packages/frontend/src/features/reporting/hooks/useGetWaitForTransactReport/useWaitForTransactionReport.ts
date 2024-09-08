import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/constants/queryKeys'
import { ReportService, useEpoch, useUserState } from '@/features/core'

export function useWaitForTransactionReport() {
    const { getGuaranteedUserState } = useUserState()
    const { currentEpoch } = useEpoch()
    return useQuery({
        queryKey: [QueryKeys.ReportsWaitingForTransaction, currentEpoch],
        queryFn: async () => {
            const userState = await getGuaranteedUserState()
            const reportService = new ReportService(userState)
            return reportService.fetchWaitFotTransactionReports()
        },
    })
}
