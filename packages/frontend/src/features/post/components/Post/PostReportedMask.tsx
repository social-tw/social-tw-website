import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'
import { useDialog } from '@/features/shared'
import ActionLinks from '../ReportedMask/ActionLinks'
import ConfirmDialog from '../ReportedMask/ConfirmDialog'
import ReportReason from '../ReportedMask/ReportReason'

interface PostReportedMaskProps {
    reason?: string
    onRemove: () => void
}

export function PostReportedMask({
    reason = '',
    onRemove,
}: PostReportedMaskProps) {
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
