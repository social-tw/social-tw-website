import SubmittingImg from '@/assets/img/report-form-result-submitting.webp'
import { Backdrop } from '@/features/shared'
import {
    Dialog as HeadlessDialog,
    DialogPanel as HeadlessDialogPanel,
} from '@headlessui/react'
import './reportFormSubmitting.css'

export function ReportFormSubmitting() {
    return (
        <HeadlessDialog className="relative z-40" open onClose={() => {}}>
            <Backdrop isOpen position="fixed" background="bg-black/70">
                <div className="flex items-center justify-center min-h-full p-4">
                    <HeadlessDialogPanel
                        className="flex flex-col items-center gap-8 relative w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-transparent shadow-base"
                        as="dialog"
                    >
                        <img
                            className="shrink-0 float-animation"
                            src={SubmittingImg}
                            alt="report-form-submitting"
                        />
                        <HintWording />
                    </HeadlessDialogPanel>
                </div>
            </Backdrop>
        </HeadlessDialog>
    )
}

function HintWording() {
    return (
        <div className="flex flex-col items-center text-white text-[18px] leading-loose">
            <div>您的檢舉報告正在送出中</div>
            <div>請稍後</div>
        </div>
    )
}
