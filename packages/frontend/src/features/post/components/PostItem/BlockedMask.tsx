import { ReactComponent as GavelClosedIcon } from '@/assets/svg/gavel-closed.svg'

export function BlockedMask() {
    return (
        <div className="text-white/50 flex flex-row gap-2 items-center justify-center bg-gradient-to-br from-[#232323] via-[#131313] to-[#2A2A2A] rounded-xl border-black/40 border-2">
            <p>此則貼文已被檢舉並屏蔽</p>
            <GavelClosedIcon className="h-auto basis-36 shrink" />
        </div>
    )
}
