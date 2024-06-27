import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from '@headlessui/react'
import AdjudicationForm, {
    AdjudicateFormValues,
    ReportData,
} from './AdjudicateForm'

export default function AdjudicationDialog({
    reportData,
    open = false,
    onClose = () => {},
    onSubmit = () => {},
}: {
    reportData: ReportData
    open?: boolean
    onClose?: () => void
    onSubmit?: (values: AdjudicateFormValues) => void
}) {
    return (
        <Dialog className="relative z-50" open={open} onClose={onClose}>
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
                <DialogPanel className="relative w-11/12 max-w-xl p-0 shadow-base">
                    <CloseButton className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-[#051532]">
                        <CloseIcon />
                    </CloseButton>
                    <div className="max-h-[90vh] overflow-y-auto gradient-border-4 rounded-xl">
                        <AdjudicationForm
                            reportData={reportData}
                            onSubmit={onSubmit}
                        />
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
