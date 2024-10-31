import { ReactComponent as GavelRaisedIcon } from '@/assets/svg/gavel-raised.svg'
import { AdjudicateValue } from '@/constants/report'
import AdjudicateActions from './AdjudicateActions'
import ReportContent from './ReportContent'
import ReportReason from './ReportReason'

export interface ReportData {
    id: string
    content: string
    category: number
    reason: string
}

export interface AdjudicateFormValues {
    reportId: string
    adjudicateValue: AdjudicateValue
}

export default function AdjudicateCancelFrom({
    reportData,
    onSubmit = () => {},
}: {
    reportData: ReportData
    onSubmit?: (values: AdjudicateFormValues) => void
}) {
    function onAgree() {
        onSubmit({
            reportId: reportData.id,
            adjudicateValue: AdjudicateValue.Agree,
        })
    }

    function onDisagree() {
        onSubmit({
            reportId: reportData.id,
            adjudicateValue: AdjudicateValue.Disagree,
        })
    }

    return (
        <article
            className="py-10 space-y-4 md:py-14 md:space-y-5"
            data-testid="adjudication-form"
        >
            <section className="px-6 md:px-14">
                <p className="text-base font-medium leading-relaxed tracking-wider md:leading-slightly-loose">
                    親愛的用戶：
                    <br />
                    <br />
                    你確定要放棄這個評判機會嗎？
                    協助評判不僅能與其他用戶一同維護平台的自治與健康，也能提高聲譽分數1分
                </p>
            </section>
            <footer className="px-6 md:px-14">
                <div className="flex gap-12">
                    <button
                        className="flex-1 text-lg font-bold text-white btn btn-primary"
                        onClick={onAgree}
                    >
                        確認放棄
                    </button>
                    <button
                        className="flex-1 text-lg font-bold text-white btn btn-primary"
                        onClick={onDisagree}
                    >
                        前往協助評判
                    </button>
                </div>
            </footer>
        </article>
    )
}
