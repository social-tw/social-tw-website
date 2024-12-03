import { usePendingReports } from '@/features/reporting/hooks/usePendingReports/usePendingReports'

export function usePostReportReason(postId: string): {
    reason?: string
    isLoading: boolean
    error: any
    refetch: () => void
} {
    const { data: reports, isLoading, error, refetch } = usePendingReports()

    const reason = reports
        ? reports.find((report) => report.object.postId === postId)?.reason
        : undefined

    return {
        reason,
        isLoading,
        error,
        refetch,
    }
}
