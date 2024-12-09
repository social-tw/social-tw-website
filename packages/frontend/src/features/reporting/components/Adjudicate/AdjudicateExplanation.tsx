import { ReactComponent as GavelRaisedIcon } from '@/assets/svg/gavel-raised.svg'
import { AdjudicateValue } from '@/constants/report'
export interface AdjudicateFormValues {
    reportId: string
    adjudicateValue: AdjudicateValue
}

export default function AdjudicateExplanation({
    onClick = () => {},
}: {
    onClick?: () => void
}) {
    return (
        <article
            className="py-10 space-y-4 md:pt-14 md:pb-6 md:space-y-5"
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
                    恭喜你被隨機選為一則檢舉案件的評判官之一！ Unirep Social
                    Taiwan
                    為一去中心化的用戶自治管理社群平台，藉由透過檢舉不當內容的方式來
                    <span className="text-secondary">維持社群的安全與健康</span>
                    。 當檢舉案件被成功上鏈交易後，該檢舉案件將
                    <span className="text-secondary">交由5位隨機用戶進行</span>
                    檢舉內容的評判審核，協助評判的用戶的
                    <span className="text-secondary">聲譽分數將提高1分</span>。
                    <br />
                    若檢舉案評判最終結果為同意檢舉為多數，則該則內容會被屏蔽。
                    協助評判後，會等
                    <span className="text-secondary">評判最終結果出爐</span>
                    會再另行透過
                    <span className="text-secondary">「通知中心」</span>
                    通知你，請留意通知中心的訊息。
                </p>
            </section>
            <footer className="px-6 md:px-14 flex items-center justify-center">
                <button
                    className="text-lg font-bold text-white btn btn-primary md: w-60 mt-20"
                    onClick={onClick}
                >
                    查看案件詳情進行評判
                </button>
            </footer>
        </article>
    )
}
