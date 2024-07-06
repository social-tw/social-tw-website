import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'

export default function AdjudicateSuccess({
    open = false,
    onClose = () => {},
}: {
    open?: boolean
    onClose?: () => void
}) {
    return (
        <Dialog className="relative z-50" open={open} onClose={onClose}>
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
                <DialogPanel className="relative w-11/12 max-w-xl p-0 shadow-base">
                    <div className="flex flex-col items-center gap-5">
                        <GavelIcon className="h-auto w-36" />
                        <p className="text-lg font-normal leading-loose tracking-wider text-center text-white">
                            您的檢舉評判正在送出中，
                            <br />
                            請留意留右方資訊 確認存取狀態。
                            <br />
                        </p>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
