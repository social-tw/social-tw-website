import { Backdrop } from '@/features/shared'
import {
    Dialog as HeadlessDialog,
    DialogPanel as HeadlessDialogPanel,
} from '@headlessui/react'

export function ReportFormSubmitting() {
    return (
        <HeadlessDialog className="relative z-40" open onClose={() => {}}>
            <Backdrop isOpen position="fixed" background="bg-black/70">
                <div className="flex items-center justify-center min-h-full p-4">
                    <HeadlessDialogPanel
                        className="relative block w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-white/90 shadow-base"
                        as="dialog"
                    >
                        <div>提交中...</div>
                    </HeadlessDialogPanel>
                </div>
            </Backdrop>
        </HeadlessDialog>
    )
}
