import { Dialog } from '@/features/shared'

export default function ConfirmDialog({
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
            <div className="py-6 px-12 flex flex-col items-center justify-between gap-16">
                <section className="pt-8">
                    <p className="tracking-wide leading-7">
                        親愛的用戶：
                        <br />
                        <br />
                        此被檢舉屏蔽的內容可能有涉及不當內容（如具歧視性言論、商業廣告、情色裸露、性暗示、違反政府法令、或其他有損社群秩序之內容），因此被屏蔽。請確認您是否依然想查看？
                    </p>
                </section>
                <section className="flex justify-center gap-3 w-full">
                    <button
                        className="w-full h-12 rounded-lg text-white/90 flex justify-center items-center font-bold tracking-[30%] bg-primary/90"
                        onClick={onClose}
                    >
                        取消查看
                    </button>
                    <button
                        className="w-full h-12 rounded-lg text-white/90 flex justify-center items-center font-bold tracking-[30%] bg-primary/90"
                        onClick={onConfirm}
                    >
                        查看屏蔽內容
                    </button>
                </section>
            </div>
        </Dialog>
    )
}
