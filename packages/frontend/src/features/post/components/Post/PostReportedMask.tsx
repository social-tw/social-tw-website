import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'
import { Dialog, useDialog } from '@/features/shared'

interface PostReportedMaskProps {
    reason: string
    onRemove: () => void
}

interface ReportReasonProps {
    reason: string
}

interface ActionLinksProps {
    onClick: () => void
}

function ReportReason({ reason }: ReportReasonProps) {
    const maxLength = 60

    const displayReason =
        reason.length > maxLength ? `${reason.slice(0, maxLength)}...` : reason

    return (
        <div className="mt-2 max-w-full">
            <h3 className="text-sm tracking-wide">被檢舉原因類別</h3>
            <p className="text-xs font-medium text-white/90 text-wrap overflow-wrap break-word max-w-[300px]">
                {displayReason}
            </p>
        </div>
    )
}

function ActionLinks({ onClick }: ActionLinksProps) {
    return (
        <nav className="flex gap-5 self-end text-right max-md:mt-10">
            <a href="#have to modify" className="basis-auto underline">
                為什麼會有內容被檢舉？
            </a>
            <button className="underline" onClick={onClick}>
                查看屏蔽內容
            </button>
        </nav>
    )
}

function ConfirmDialog({
    isOpen,
    onClose = () => {},
    onConfirm = () => {},
}: {
    isOpen?: boolean
    onClose?: () => void
    onConfirm?: () => void
}) {
    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <section className="pt-12 pb-6 px-12">
                <p className="font-semibold text-black/90">
                    親愛的用戶：
                    <br />
                    <br />
                    此被檢舉屏蔽的內容可能有涉及不當內容（如具歧視性言論、商業廣告、情色裸露、性暗示、違反政府法令、或其他有損社群秩序之內容），因此被屏蔽。請確認您是否依然想查看？
                </p>
            </section>
            <section className="flex justify-center gap-3 p-6 md:p-12 md:pt-0">
                <button
                    className="py-3 w-full rounded-lg bg-primary/90 text-white/90 flex justify-center items-center font-bold tracking-[30%]"
                    onClick={onClose}
                >
                    取消查看
                </button>
                <button
                    className="w-full py-3 rounded-lg bg-primary/90 text-white/90 flex justify-center items-center font-bold tracking-[30%]"
                    onClick={onConfirm}
                >
                    查看屏蔽內容
                </button>
            </section>
        </Dialog>
    )
}

export function PostReportedMask({ reason, onRemove }: PostReportedMaskProps) {
    const {
        isOpen: isDialogOpen,
        onOpen: onDialogOpen,
        onClose: onDialogClose,
    } = useDialog()

    return (
        <div
            className={`
                z-10 w-full h-full absolute top-0 left-0 text-white 
                flex flex-col gap-2 px-4 items-center justify-center 
                bg-gradient-to-br from-[#0c3037] via-[#131313] to-[#502a0c]
                rounded-xl border-black border-2
            `}
        >
            <header className="flex gap-2 items-center justify-center max-w-full pb-2">
                <div className=" max-w-full">
                    <h2 className="text-base font-bold tracking-wide">
                        此則貼文已被檢舉，正在審核中...
                    </h2>
                    <ReportReason reason={reason} />
                </div>
                <GavelIcon className="h-20 w-20" />
            </header>
            <div className="absolute bottom-2 right-3 text-xs font-medium">
                <ActionLinks onClick={onDialogOpen} />
            </div>
            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={onDialogClose}
                onConfirm={onRemove}
            />
        </div>
    )
}
