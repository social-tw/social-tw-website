import { PATHS } from '@/constants/paths'
import { QueryKeys } from '@/constants/queryKeys'
import { useAuthStatus } from '@/features/auth'
import { genReportIdentityProof, useUserState } from '@/features/core'
import { ReportService } from '@/features/core/services/ReportService/ReportService'
import { useFetchReportCategories } from '@/features/reporting'
import { ReportStatus } from '@/types/Report'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

export default function ReportDetailsPage() {
    return (
        <>
            <div className="p-4 space-y-6">
                <ReportResult />
                <ReportObjectContent />
                <ReportReason />
            </div>
            <FetchReportPending />
            <FetchReportFailure />
        </>
    )
}

function FetchReportPending() {
    const { id } = useParams()
    const { isPending } = useReportItem(id)
    const { isLoggingIn } = useAuthStatus()

    return (
        <Dialog
            className="relative z-50"
            open={isLoggingIn || isPending}
            onClose={() => {}}
        >
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
                <DialogPanel className="relative p-0 w-85 shadow-base">
                    <div className="px-6 py-10 md:px-10 md:py-14 rounded-xl bg-white/90">
                        <progress className="h-3 mb-2 bg-white shadow-inner shadow-black/25 progress progress-gradient" />
                        <p className="text-sm text-[#080717] font-normal text-center">
                            系統正在為您登入會員身份
                            <br />
                            稍候即可查看檢舉評判結果
                        </p>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}

function FetchReportFailure() {
    const { id } = useParams()
    const { isFetched } = useReportItem(id)
    const { isLoggedIn } = useAuthStatus()

    return (
        <Dialog
            className="relative z-50"
            open={!isLoggedIn && isFetched}
            onClose={() => {}}
        >
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
                <DialogPanel className="relative p-0 w-85 shadow-base">
                    <article className="px-6 py-10 md:px-10 md:py-14 rounded-xl bg-white/90">
                        <section>
                            <p className="text-base text-[#080717] font-medium leading-7">
                                請註冊/登入 Unirep Social Taiwan
                                即可查看檢舉評判結果
                            </p>
                        </section>
                        <footer className="flex flex-col gap-4 mt-10">
                            <Link
                                className="py-3 text-base font-bold text-center text-white rounded-md bg-primary"
                                to={PATHS.LAUNCH}
                            >
                                什麼是 Unirep Social Taiwan？
                            </Link>
                            <Link
                                className="py-3 text-base font-bold text-center text-white rounded-md bg-primary"
                                to={PATHS.WELCOME}
                            >
                                前往註冊/登入頁面
                            </Link>
                        </footer>
                    </article>
                </DialogPanel>
            </div>
        </Dialog>
    )
}

function ReportResult() {
    const { id } = useParams()
    const { data: report } = useReportItem(id)
    const { data: adjudicator, isPending } = useReportAdjudicator(id)

    const dateLabel = formatDate(Number(report?.reportAt))

    const adjudicationLabel = useMemo(() => {
        return isPending
            ? ''
            : adjudicator
            ? adjudicator.adjudicateValue === 1
                ? '同意'
                : '不同意'
            : '尚未評判'
    }, [adjudicator, isPending])

    const resultLabel = useMemo(() => {
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
    }, [report])

    return (
        <section>
            <h2 className="mb-4 text-xl font-bold text-white">評判詳情</h2>
            <div className="p-4 space-y-2 bg-white rounded-xl text-content">
                <p>檢舉日期：{dateLabel}</p>
                <p>檢舉評判：{adjudicationLabel}</p>
                <p>最終結果：{resultLabel}</p>
            </div>
        </section>
    )
}

function ReportObjectContent() {
    const { id } = useParams()
    const { data: report } = useReportItem(id)

    return (
        <section>
            <h2 className="mb-4 text-xl font-bold text-white">被檢舉之內容</h2>
            <div className="p-4 bg-white rounded-xl text-content">
                <p className="whitespace-pre-wrap">{report?.object?.content}</p>
            </div>
        </section>
    )
}

function ReportReason() {
    const { id } = useParams()
    const { data: report } = useReportItem(id)

    const { reportCategories } = useFetchReportCategories()

    const reportCategoryLabel = useMemo(() => {
        if (!report) return ''
        const reportCategory = reportCategories.find(
            (c) => c.number === report?.category,
        )
        return reportCategory?.description ?? ''
    }, [report, reportCategories])

    return (
        <section>
            <h2 className="mb-4 text-xl font-bold text-white">
                檢舉原因分類&詳情說明
            </h2>
            <div className="p-4 space-y-4 bg-white rounded-xl text-content">
                <p>
                    <span className="font-bold">原因分類：</span>
                    <span>{reportCategoryLabel}</span>
                </p>
                <p>
                    <span className="font-bold">詳情說明：</span>
                    <span>{report?.reason}</span>
                </p>
            </div>
        </section>
    )
}

function useReportItem(reportId?: string) {
    const { userState } = useUserState()

    return useQuery({
        queryKey: [QueryKeys.SingleReport, reportId],
        queryFn: async () => {
            const _reportId = Number(reportId)
            if (isNaN(_reportId) || _reportId < 0) return undefined
            const reportService = new ReportService(userState)
            return reportService.fetchReportById(_reportId.toString())
        },
        enabled: !!reportId,
    })
}

function useReportAdjudicator(reportId?: string) {
    const { userState } = useUserState()

    const { data: report } = useReportItem(reportId)

    return useQuery({
        queryKey: [
            QueryKeys.Adjudicator,
            report?.reportId,
            userState?.id.toString(),
        ],
        queryFn: async () => {
            if (!userState || !report) {
                return undefined
            }

            const { publicSignals } = await genReportIdentityProof(userState, {
                reportId: report.reportId,
            })

            const nullifierStr = publicSignals[0].toString()
            const adjudicator = report.adjudicatorsNullifier?.find(
                (adj) => adj.nullifier === nullifierStr,
            )

            return adjudicator
        },
        enabled: !!report && !!userState,
    })
}

function formatDate(date: number) {
    if (!date) return ''
    return dayjs(date).format('YYYY/MM/DD')
}
