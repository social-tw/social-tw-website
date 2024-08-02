import { QueryKeys } from '@/constants/queryKeys'
import { ReportService } from '@/features/core'
import { useQuery } from '@tanstack/react-query'

export function useFetchReportCategories() {
    const { data } = useQuery({
        queryKey: [QueryKeys.ReportCategory],
        queryFn: async () => {
            const reportService = new ReportService()
            return reportService.fetchReportCategories()
        },
    })
    return {
        reportCategories: data || [],
    }
}
