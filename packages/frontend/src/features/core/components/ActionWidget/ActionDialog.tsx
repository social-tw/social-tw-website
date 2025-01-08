import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from '@headlessui/react'
import ActionTable from './ActionTable'

export default function ActionDialog({
    open = false,
    onClose = () => {},
}: {
    open?: boolean
    onClose?: () => void
}) {
    return (
        <Dialog className="relative z-40" open={open} onClose={onClose}>
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="min-h-full px-4 pt-[12rem] md:py-4 md:flex md:justify-center md:items-center">
                    <DialogPanel className="relative w-full max-w-md mx-auto overflow-hidden rounded-xl bg-black/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <CloseButton className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-white/90">
                            <CloseIcon />
                        </CloseButton>
                        <div className="p-6 rounded-xl">
                            <ActionTable onClose={onClose} />
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
