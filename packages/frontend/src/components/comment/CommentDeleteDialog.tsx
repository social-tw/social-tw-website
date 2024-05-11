import Dialog from '@/components/common/Dialog'

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
            <section className="p-6 md:px-12">
                <p className="text-base font-medium text-black/90">
                    親愛的用戶：
                    <br />
                    <br />
                    留言刪除後即無法復原，您確定要刪除這則留言嗎？
                </p>
            </section>
            <section className="flex justify-center p-6 md:p-12 md:pt-0">
                <button
                    className="max-w-[285px] w-full h-14 rounded-lg bg-primary/90 text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%]"
                    onClick={onConfirm}
                >
                    確認刪除
                </button>
            </section>
        </Dialog>
    )
}
