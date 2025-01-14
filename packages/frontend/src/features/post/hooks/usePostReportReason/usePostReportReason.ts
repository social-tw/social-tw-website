import { useFetchReportCategories } from '@/features/reporting'
import { usePendingReports } from '@/features/reporting/hooks/usePendingReports/usePendingReports'
import { useEffect, useMemo } from 'react'

export function usePostReportReason(postId: string): {
    category?: string
    reason?: string
    isLoading: boolean
    error: any
    refetch: () => void
} {
    const { data: reports, isLoading, error, refetch } = usePendingReports()

    const { reportCategories } = useFetchReportCategories()

    const report = useMemo(() => reports?.find((report) => report.object.postId === postId), [postId, reports])

    const reportCategoryLabel = useMemo(() => {
            if (!report) return ''
            const reportCategory = reportCategories.find(
                (c) => c.number === report?.category,
            )
            return reportCategory?.description ?? ''
    }, [report, reportCategories])

    useEffect(() => {
        if (!report) {
            refetch()
        }
    }, [refetch, report])

    return {
        category: reportCategoryLabel,
        reason: report?.reason,
        isLoading,
        error,
        refetch,
    }
}
