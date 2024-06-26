import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'
import { REPORT_CATEGORY_LABELS, ReportCategory } from '@/constants/ui'
import { useCounter, useHarmonicIntervalFn } from 'react-use'

function ReportContent() {
    const reportContent =
        '和幾個好友一起探索了台灣的小巷弄，發現了一家隱藏版的小吃店，美味的古早味讓我們瞬間回味童年。這次的冒險不僅填飽了肚子，更充實了心靈。人生就是要不斷發現驚喜，就算在家鄉也能有無限的探'

    return (
        <div className="pt-3">
            <div className="relative rounded-lg bg-dark-gradient h-36">
                <h3 className="absolute px-2 py-1 text-sm font-bold text-white rounded-lg -top-3 left-4 bg-dark-gradient">
                    被檢舉之內容
                </h3>
                <div className="h-full p-4 pt-5 overflow-auto">
                    <p className="text-sm font-medium leading-relaxed tracking-wider text-white md:leading-slightly-loose">
                        {reportContent}
                    </p>
                </div>
            </div>
        </div>
    )
}

function ReportReason() {
    const reportCategory = ReportCategory.Solicitation
    const reportReason = '偷偷置入性廣告，不OK餒！'

    return (
        <div className="pt-3">
            <div className="relative rounded-lg bg-dark-gradient h-36">
                <h3 className="absolute px-2 py-1 text-sm font-bold text-white rounded-lg -top-3 left-4 bg-dark-gradient">
                    檢舉原因＆詳情
                </h3>
                <div className="h-full p-4 pt-5 overflow-auto">
                    <p className="text-sm font-medium leading-relaxed tracking-wider text-white md:leading-slightly-loose">
                        原因分類：{REPORT_CATEGORY_LABELS[reportCategory]}
                    </p>
                    <p className="text-sm font-medium leading-relaxed tracking-wider text-white md:leading-slightly-loose">
                        詳情說明：{reportReason}
                    </p>
                </div>
            </div>
        </div>
    )
}

function AdjudicationActions() {
    const [count, { dec }] = useCounter(10)

    useHarmonicIntervalFn(
        () => {
            if (count > 0) {
                dec()
            }
        },
        count === 0 ? null : 1000,
    )

    const isReady = count === 0
    const message = isReady ? '已可進行評判' : `${count}秒後即可進行評判`

    return (
        <>
            <p className="mb-1 text-xs text-right text-neutral-600">
                {message}
            </p>
            <div className="flex gap-4">
                <button
                    className="flex-1 text-lg font-bold text-white btn btn-primary"
                    disabled={!isReady}
                >
                    同意檢舉
                </button>
                <button
                    className="flex-1 text-lg font-bold text-white btn btn-secondary"
                    disabled={!isReady}
                >
                    否決檢舉
                </button>
            </div>
        </>
    )
}

export default function AdjudicationForm() {
    return (
        <article
            className="py-10 space-y-4 md:py-14 md:space-y-5"
            data-testid="adjudication-form"
        >
            <header className="px-6 md:px-14">
                <div className="flex items-center justify-center gap-2 md:gap-4">
                    <GavelIcon className="w-16 h-auto" />
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
                <ReportContent />
            </section>
            <section className="px-6 md:px-14">
                <ReportReason />
            </section>
            <footer className="px-6 md:px-14">
                <AdjudicationActions />
            </footer>
        </article>
    )
}
