import { ReactComponent as GavelRaisedIcon } from '@/assets/svg/gavel-raised.svg'
import { AdjudicateValue, ReportCategory } from '@/constants/report'
import AdjudicateActions from './AdjudicateActions'
import ReportContent from './ReportContent'
import ReportReason from './ReportReason'

export interface ReportData {
    id: string
    content: string
    category: ReportCategory
    reason: string
}

export interface AdjudicateFormValues {
    reportId: string
    value: AdjudicateValue
}

export default function AdjudicateForm({
    reportData,
    onSubmit = () => {},
}: {
    reportData: ReportData
    onSubmit?: (values: AdjudicateFormValues) => void
}) {
    function onAgree() {
        onSubmit({
            reportId: reportData.id,
            value: AdjudicateValue.Agree,
        })
    }

    function onDisagree() {
        onSubmit({
            reportId: reportData.id,
            value: AdjudicateValue.Disagree,
        })
    }

    return (
        <article
            className="py-10 space-y-4 md:py-14 md:space-y-5"
            data-testid="adjudication-form"
        >
            <header className="px-6 md:px-14">
                <div className="flex items-center justify-center gap-2 md:gap-4">
                    <GavelRaisedIcon className="w-16 h-auto" />
                    <hgroup className="flex flex-col items-center md:flex-row md:gap-2">
                        <h1 className="text-3xl font-bold">檢舉案件</h1>
                        <p className="text-2xl font-bold md:text-3xl">
                            由你來評判
                        </p>
                    </hgroup>
                </div>
            </header>
            <section className="px-6 md:px-14">
                <p className="text-base font-medium leading-relaxed tracking-wider md:leading-slightly-loose">
                    親愛的用戶：
                    <br />
                    恭喜你被選為本檢舉案件的評判員，一同維繫 Unirep Social
                    Taiwan
                    安全和平的匿名社群環境。請就以下文字內容判斷是否同意檢舉。集滿
                    5 個評判後即評判結束。
                </p>
            </section>
            <section className="px-6 md:px-14">
                <ReportContent content={reportData.content} />
            </section>
            <section className="px-6 md:px-14">
                <ReportReason
                    category={reportData.category}
                    reason={reportData.reason}
                />
            </section>
            <footer className="px-6 md:px-14">
                <AdjudicateActions onAgree={onAgree} onDisagree={onDisagree} />
            </footer>
        </article>
    )
}
