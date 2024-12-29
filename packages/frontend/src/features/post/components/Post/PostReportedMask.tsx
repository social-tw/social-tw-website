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
                text-white 
                flex flex-col px-6 pt-6 gap-6 items-center justify-center 
                bg-gradient-to-br from-[#0c3037] via-[#131313] to-[#502a0c]
                rounded-xl border-black border-2
            `}
        >
            <div className="flex gap-2 items-center justify-center w-full">
                <div className="flex flex-col gap-2">
                    <h2 className="text-base font-bold tracking-wide">
                        此則貼文已被檢舉，正在審核中...
                    </h2>
                    <ReportReason reason={reason} />
                </div>
                <div className="shrink-0">
                    <GavelIcon className="h-20 w-20" />
                </div>
            </div>
            <ActionLinks onClick={onDialogOpen} />
            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={onDialogClose}
                onConfirm={onRemove}
            />
        </div>
    )
}
