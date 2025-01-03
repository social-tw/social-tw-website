import { ReactComponent as GavelClosedIcon } from '@/assets/svg/gavel-closed.svg'

export function CommentBlockedMask() {
    return (
        <div className="flex flex-row gap-2 items-center justify-center bg-gradient-to-br from-[#232323] via-[#131313] to-[#2A2A2A] rounded-xl border-black/40 border-2">
            <p className="text-white/50">此則留言已被檢舉並屏蔽</p>
            <GavelClosedIcon className="h-auto basis-36 shrink" />
        </div>
    )
}
