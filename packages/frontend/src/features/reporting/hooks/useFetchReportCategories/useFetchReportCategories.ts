import { QueryKeys } from '@/constants/queryKeys'
import { fetchReportCategories } from '@/features/reporting/utils/apis'
import { useQuery } from '@tanstack/react-query'

export function useFetchReportCategories() {
    const { data } = useQuery({
        queryKey: [QueryKeys.ReportCategory],
        queryFn: fetchReportCategories,
    })
    return {
        reportCategories: data || [],
    }
}
