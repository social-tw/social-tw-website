import Dialog from '@/components/common/Dialog'

interface VoteFailureDialogProp {
    isOpen: boolean
    onClose: () => void
}

export default function VoteFailureDialog({
    isOpen,
    onClose,
}: VoteFailureDialogProp) {
    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <section className="p-6 md:px-12">
                <p className="text-base font-medium text-black/90">
                    親愛的用戶：
                    <br />
                    <br />
                    很抱歉通知您，我們注意到您在Vote時似乎遇到了網路連線不穩定的情況，導致Vote失敗。我們深感抱歉給您帶來的不便。請您再次嘗試Vote{' '}
                    <br />
                    <br />
                    感謝您的理解與合作。
                </p>
            </section>
            <section className="flex justify-center p-6 md:p-12 md:pt-0">
                <button
                    className="max-w-[285px] w-full h-14 rounded-lg bg-primary/90 text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%]"
                    type="button"
                    onClick={onClose}
                >
                    重新Vote
                </button>
            </section>
        </Dialog>
    )
}


