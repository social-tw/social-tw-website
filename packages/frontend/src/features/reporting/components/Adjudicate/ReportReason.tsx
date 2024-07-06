import { REPORT_CATEGORY_LABELS, ReportCategory } from '@/constants/report'

export default function ReportReason({
    category,
    reason,
}: {
    category: ReportCategory
    reason: string
}) {
    return (
        <div className="pt-3">
            <div className="relative rounded-lg bg-dark-gradient h-36">
                <h3 className="absolute px-2 py-1 text-sm font-bold text-white rounded-lg -top-3 left-4 bg-dark-gradient">
                    檢舉原因＆詳情
                </h3>
                <div className="h-full p-4 pt-5 overflow-auto">
                    <p className="text-sm font-medium leading-relaxed tracking-wider text-white md:leading-slightly-loose">
                        原因分類：{REPORT_CATEGORY_LABELS[category]}
                    </p>
                    <p className="text-sm font-medium leading-relaxed tracking-wider text-white md:leading-slightly-loose">
                        詳情說明：{reason}
                    </p>
                </div>
            </div>
        </div>
    )
}
