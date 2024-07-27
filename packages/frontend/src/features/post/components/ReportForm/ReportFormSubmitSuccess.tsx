import ResultSuccess from '@/assets/img/report-form-result-success.webp'
import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import { Backdrop } from '@/features/shared'
import {
    Dialog as HeadlessDialog,
    DialogPanel as HeadlessDialogPanel,
} from '@headlessui/react'

interface ReportFormSubmitSuccessProps {
    onClose: () => void
}

export function ReportFormSubmitSuccess({
    onClose,
}: ReportFormSubmitSuccessProps) {
    return (
        <HeadlessDialog className="relative z-40" open onClose={onClose}>
            <Backdrop isOpen position="fixed" background="bg-black/70">
                <div className="flex items-center justify-center min-h-full p-4">
                    <HeadlessDialogPanel
                        className="flex flex-col items-center gap-0 relative w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-transparent shadow-base"
                        as="dialog"
                    >
                        <img
                            src={ResultSuccess}
                            alt="report-form-result-success"
                        />
                        <HintWording />
                        <button
                            aria-label="close"
                            className="absolute top-[-40px] right-[40px] btn btn-sm btn-circle btn-ghost text-white"
                            type="submit"
                            onClick={onClose}
                        >
                            <CloseIcon />
                        </button>
                    </HeadlessDialogPanel>
                </div>
            </Backdrop>
        </HeadlessDialog>
    )
}

function HintWording() {
    return (
        <div className="flex flex-col items-center text-white text-lg leading-loose">
            <div>您的檢舉報告傳送成功！</div>
            <div>將由平台用戶們進行評判</div>
        </div>
    )
}
