import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'

export function CommentReportedMask() {
    return (
        <div className="flex flex-row gap-2 items-center justify-center bg-gradient-to-br from-[#0c3037] via-[#131313] to-[#502a0c] rounded-xl border-black border-2">
            <div className="text-white">
                <p>此則留言已被檢舉，</p>
                <p>正在審核中...</p>
            </div>
            <GavelIcon className="h-auto w-36" />
        </div>
    )
}
