import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from '@headlessui/react'

export default function CheckInFailure({
    open = false,
    onClose = () => {},
    onRetry = () => {},
}: {
    open?: boolean
    onClose?: () => void
    onRetry?: () => void
}) {
    return (
        <Dialog className="relative z-50" open={open} onClose={onClose}>
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
                <DialogPanel className="relative w-11/12 max-w-xl p-0 shadow-base">
                    <CloseButton className="absolute text-white top-4 right-4 btn btn-sm btn-circle btn-ghost">
                        <CloseIcon />
                    </CloseButton>
                    <section className="py-14">
                        <div className="flex flex-col items-center gap-8">
                            <p className="text-lg font-normal leading-loose tracking-wider text-center text-white">
                                抱歉，可能因網路連線問題，
                                <br />
                                造成您的簽到失敗，
                                <br />
                                請再點擊以下按鈕再次進行簽到。
                            </p>
                            <button
                                className="px-8 text-xl font-bold tracking-widest text-white btn btn-secondary h-14"
                                onClick={onRetry}
                            >
                                再次嘗試簽到
                            </button>
                        </div>
                    </section>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
