import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'
import { useDialog } from '@/features/shared'
import { usePostReportReason } from '../../hooks/usePostReportReason/usePostReportReason'
import ActionLinks from '../ReportedMask/ActionLinks'
import ConfirmDialog from '../ReportedMask/ConfirmDialog'
import ReportReason from '../ReportedMask/ReportReason'

export function ReportedMask({
    postId,
    onRemoveMask = () => {},
}: {
    postId: string
    onRemoveMask?: () => void
}) {
    const { category } = usePostReportReason(postId)

    const {
        isOpen: isDialogOpen,
        onOpen: onDialogOpen,
        onClose: onDialogClose,
    } = useDialog()

    return (
        <div className="text-white flex flex-col px-6 pt-6 gap-6 items-center justify-center bg-gradient-to-br from-[#0c3037] via-[#131313] to-[#502a0c] rounded-xl border-black border-2">
            <div className="flex items-center justify-center w-full gap-2">
                <div className="flex flex-col gap-2">
                    <h2 className="text-base font-bold tracking-wide">
                        此則貼文已被檢舉，正在審核中...
                    </h2>
                    <ReportReason reason={category ?? ''} />
                </div>
                <div className="shrink-0">
                    <GavelIcon className="w-20 h-20" />
                </div>
            </div>
            <ActionLinks onClick={onDialogOpen} />
            <ConfirmDialog
                isOpen={isDialogOpen}
                onClose={onDialogClose}
                onConfirm={onRemoveMask}
            />
        </div>
    )
}
