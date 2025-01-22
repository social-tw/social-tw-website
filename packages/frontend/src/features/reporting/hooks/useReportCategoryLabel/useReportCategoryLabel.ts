import { ReportCategory } from '@/constants/report'
import { useMemo } from 'react'
import { useFetchReportCategories } from '../useFetchReportCategories/useFetchReportCategories'

export function useReportCategoryLabel(category?: ReportCategory) {
    const { reportCategories } = useFetchReportCategories()

    const reportCategoryLabel = useMemo(() => {
        const categoryMeta = reportCategories.find((c) => c.number === category)
        return categoryMeta?.description ?? ''
    }, [category, reportCategories])

    return { label: reportCategoryLabel }
}
