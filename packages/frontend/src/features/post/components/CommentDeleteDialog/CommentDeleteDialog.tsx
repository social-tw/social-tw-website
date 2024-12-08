import { Dialog } from '@/features/shared'

export default function CommentDeleteDialog({
    open = false,
    onClose = () => {},
    onConfirm = () => {},
}: {
    open?: boolean
    onClose?: () => void
    onConfirm?: () => void
}) {
    return (
        <Dialog isOpen={open} onClose={onClose}>
            <div className="py-8 px-12 flex flex-col items-center justify-between gap-16 w-full">
                <p className="mt-6 tracking-wide leading-7">
                    親愛的用戶：
                    <br />
                    留言刪除後即無法復原，您確定要刪除這則留言嗎？
                </p>
                <button
                    className="max-w-[280px] w-full h-14 rounded-lg text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%] bg-primary/90"
                    type="button"
                    onClick={onConfirm}
                >
                    確認刪除
                </button>
            </div>
        </Dialog>
    )
}
