import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import { Backdrop } from '@/features/shared'
import {
    Dialog as HeadlessDialog,
    DialogPanel as HeadlessDialogPanel,
} from '@headlessui/react'

interface ReportFormSubmitSuccessProps {
    isOpen: boolean
    onClose: () => void
}

export function ReportFormSubmitSuccess({
    isOpen,
    onClose,
}: ReportFormSubmitSuccessProps) {
    return (
        <HeadlessDialog
            className="relative z-40"
            open={isOpen}
            onClose={onClose}
        >
            <Backdrop isOpen={isOpen} position="fixed" background="bg-black/70">
                <div className="flex items-center justify-center min-h-full p-4">
                    <HeadlessDialogPanel
                        className="relative block w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-white/90 shadow-base"
                        as="dialog"
                    >
                        <button
                            aria-label="close"
                            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-[#051532]"
                            type="submit"
                            onClick={onClose}
                        >
                            <CloseIcon />
                        </button>
                        <div>成功！</div>
                    </HeadlessDialogPanel>
                </div>
            </Backdrop>
        </HeadlessDialog>
    )
}
