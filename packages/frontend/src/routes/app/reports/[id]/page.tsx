import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/constants/queryKeys'
import { ReportService } from '@/features/core/services/ReportService/ReportService'
import dayjs from 'dayjs'
import { ReportStatus } from '@/types/Report'
import { useFetchReportCategories } from '@/features/reporting'

const ReportDetailsPage: React.FC = () => {
    const { id } = useParams()
    const { reportCategories } = useFetchReportCategories()
    const { data: report } = useQuery({
        queryKey: [QueryKeys.SingleReport, id],
        queryFn: async () => {
            if (!id) return undefined

            const reportService = new ReportService()
            return reportService.fetchReportById(id)
        },
    })

    const reportCategoryLabel = useMemo(() => {
        if (!report) return ''
        const reportCategory = reportCategories.find(
            (c) => c.number === report?.category,
        )
        return reportCategory?.description ?? ''
    }, [report, reportCategories])

    if (!report) return null

    const getJudgementResult = () => {
        if (!report) return ''

        switch (report.status) {
            case ReportStatus.VOTING:
                return '評判中'
            case ReportStatus.WAITING_FOR_TRANSACTION:
            case ReportStatus.COMPLETED:
                const agreeCount =
                    report.adjudicatorsNullifier?.filter(
                        (a) => a.adjudicateValue === 1,
                    ).length || 0
                const totalCount = report.adjudicatorsNullifier?.length || 0
                return agreeCount > totalCount / 2 ? '檢舉通過' : '檢舉不通過'
            default:
                return '評判中'
        }
    }

    return (
        <div className="text-white">
            <div className="p-4 space-y-6">
                <section>
                    <h2 className="text-xl font-bold mb-4">評判詳情</h2>
                    <div className="bg-white/10 rounded-xl p-4 space-y-2">
                        <p>
                            評判日期：
                            {dayjs(report.reportAt).format('YYYY/MM/DD')}
                        </p>
                        <p>檢舉評判：同意檢舉</p>
                        <p>最終結果：{getJudgementResult()}</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">被檢舉之內容</h2>
                    <div className="bg-white/10 rounded-xl p-4">
                        <p className="whitespace-pre-wrap text-white/80">
                            {report.object.content}
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">
                        檢舉原因分類&詳情說明
                    </h2>
                    <div className="bg-white/10 rounded-xl p-4 space-y-4">
                        <div>
                            <p className="font-bold">原因分類：</p>
                            <p className="text-white/80">
                                {reportCategoryLabel}
                            </p>
                        </div>
                        <div>
                            <p className="font-bold">詳情說明：</p>
                            <p className="text-white/80">{report.reason}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ReportDetailsPage
