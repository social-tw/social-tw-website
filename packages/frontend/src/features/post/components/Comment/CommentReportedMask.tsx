import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'

export function CommentReportedMask() {
    return (
        <div
            className={`
                z-10 w-full h-full absolute top-0 left-0 text-white 
                flex flex-row gap-2 items-center justify-center
                bg-gradient-to-br from-[#0c3037] via-[#131313] to-[#502a0c]
                rounded-xl border-black border-2
            `}
        >
            <div>
                <div>此則留言已被檢舉，</div>
                <div>正在審核中...</div>
            </div>
            <GavelIcon className="h-auto w-36" />
        </div>
    )
}
