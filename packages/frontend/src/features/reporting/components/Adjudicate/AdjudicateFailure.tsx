import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from '@headlessui/react'

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
                    <CloseButton className="absolute text-white top-4 right-4 btn btn-sm btn-circle btn-ghost">
                        <CloseIcon />
                    </CloseButton>
                    <div className="flex flex-col items-center gap-5">
                        <GavelIcon className="h-auto w-36" />
                        <p className="text-lg font-normal leading-loose tracking-wider text-center text-white">
                            您的評判傳送時，
                            <br />
                            似乎遇到了網路連線不穩定的情況，
                            <br />
                            導致傳送失敗，
                            <br />
                            請您再次嘗試評判檢舉案件。
                            <br />
                        </p>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
