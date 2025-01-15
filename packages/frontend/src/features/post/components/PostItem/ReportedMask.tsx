import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'
import { useReportCategoryLabel } from '@/features/reporting'
import { usePostById } from '../../hooks/usePostById/usePostById'
import { SeeContent } from './SeeContent'

export function ReportedMask({
    postId,
    onRemoveMask = () => {},
}: {
    postId: string
    onRemoveMask?: () => void
}) {
    const { data: post } = usePostById(postId)

    const { label: reportCategoryLabel } = useReportCategoryLabel(
        post?.report?.category,
    )

    return (
        <article className="py-5 space-y-4 bg-gradient-to-br from-[#0c3037] via-[#131313] to-[#502a0c] rounded-xl border-black border-2">
            <header className="flex items-center justify-center h-10 px-5 lg:px-7">
                <h2 className="text-base font-bold tracking-wide text-white">
                    此則貼文已被檢舉，正在審核中
                </h2>
                <GavelIcon className="w-20 h-20" />
            </header>
            {!!reportCategoryLabel && (
                <section className="px-5 lg:px-7">
                    <h3 className="mb-1 text-sm font-medium tracking-wide text-white">
                        被檢舉原因類別
                    </h3>
                    <p className="text-xs font-normal text-white break-words whitespace-break-spaces">
                        {reportCategoryLabel}
                    </p>
                </section>
            )}
            <footer className="flex items-center justify-end gap-5 px-5 lg:px-7">
                <a
                    href="/about?viewId=feature-community"
                    className="text-xs font-medium underline text-white/80"
                >
                    為什麼會有內容被檢舉？
                </a>
                <SeeContent onConfirm={onRemoveMask} />
            </footer>
        </article>
    )
}
