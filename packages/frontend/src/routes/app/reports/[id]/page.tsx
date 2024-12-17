import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/constants/queryKeys'
import { ReportService } from '@/features/core/services/ReportService/ReportService'
import dayjs from 'dayjs'
import { ReportHistory, ReportStatus } from '@/types/Report'
import { useFetchReportCategories } from '@/features/reporting'
import { genReportIdentityProof, useUserState } from '@/features/core'

const ReportDetailsPage: React.FC = () => {
    const { userState } = useUserState()
    const { id } = useParams()
    const { reportCategories } = useFetchReportCategories()
    const [adjudicationResult, setAdjudicationResult] =
        useState<string>('尚未評判')

    const { data: report } = useQuery({
        queryKey: [QueryKeys.SingleReport, id],
        queryFn: async () => {
            const reportId = Number(id)
            if (isNaN(reportId) || reportId < 0) return undefined
            const reportService = new ReportService(userState)
            return reportService.fetchReportById(reportId.toString())
        },
    })

    const getAdjudicationResult = useCallback(
        async (report: ReportHistory) => {
            if (!userState || !report) return '尚未評判'

            try {
                const { publicSignals } = await genReportIdentityProof(
                    userState,
                    {
                        reportId: report.reportId,
                    },
                )

                const nullifierStr = publicSignals[0].toString()
                const userAdjudication = report.adjudicatorsNullifier?.find(
                    (adj) => adj.nullifier === nullifierStr,
                )

                if (!userAdjudication) {
                    return '尚未評判'
                }

                return userAdjudication.adjudicateValue === 1
                    ? '同意'
                    : '不同意'
            } catch (error) {
                console.error('Error getting adjudication result:', error)
                return '尚未評判'
            }
        },
        [userState],
    )

    useEffect(() => {
        if (!report || !userState) return

        const fetchAdjudicationResult = async () => {
            const result = await getAdjudicationResult(report)
            setAdjudicationResult(result)
        }

        fetchAdjudicationResult()
    }, [report, userState, getAdjudicationResult])

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

    const formatDate = (date: number) => {
        if (!date) return '尚未評判'
        return dayjs(date).format('YYYY/MM/DD')
    }

    return (
        <div className="text-white">
            <div className="p-4 space-y-6">
                <section>
                    <h2 className="text-xl font-bold mb-4">評判詳情</h2>
                    <div className="bg-white rounded-xl p-4 space-y-2 text-content">
                        <p>
                            檢舉日期：
                            {formatDate(Number(report.reportAt))}
                        </p>
                        <p>檢舉評判：{adjudicationResult}</p>
                        <p>最終結果：{getJudgementResult()}</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">被檢舉之內容</h2>
                    <div className="bg-white rounded-xl p-4 text-content">
                        <p className="whitespace-pre-wrap">
                            {report.object.content}
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-4">
                        檢舉原因分類&詳情說明
                    </h2>
                    <div className="bg-white rounded-xl p-4 space-y-4 text-content">
                        <div>
                            <p className="font-bold">原因分類：</p>
                            <p>{reportCategoryLabel}</p>
                        </div>
                        <div>
                            <p className="font-bold">詳情說明：</p>
                            <p>{report.reason}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ReportDetailsPage
