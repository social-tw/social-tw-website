import ResultClose from '@/assets/img/report-form-result-close.webp'
import SubmittingImg from '@/assets/img/report-form-result-submitting.webp'
import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import { Backdrop } from '@/features/shared'
import {
    Dialog as HeadlessDialog,
    DialogPanel as HeadlessDialogPanel,
} from '@headlessui/react'

interface ReportFormSubmitFailureProps {
    onClose: () => void
}

export function ReportFormSubmitFailure({
    onClose,
}: ReportFormSubmitFailureProps) {
    return (
        <HeadlessDialog className="relative z-40" open onClose={onClose}>
            <Backdrop isOpen position="fixed" background="bg-black/70">
                <div className="flex items-center justify-center min-h-full p-4">
                    <HeadlessDialogPanel
                        className="flex flex-col items-center gap-8 relative w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-transparent shadow-base"
                        as="dialog"
                    >
                        <Img />
                        <HintWording />
                        <ReSubmitBtn onClick={onClose} />
                        <button
                            aria-label="close"
                            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-[#051532]"
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

function Img() {
    return (
        <div className="relative">
            <img src={SubmittingImg} alt="report-form-submitting" />
            <img
                className="absolute bottom-[-28px] right-[-36px]"
                src={ResultClose}
                alt="report-form-result-close"
            />
        </div>
    )
}

function HintWording() {
    return (
        <div className="flex flex-col items-center text-white text-[18px] leading-loose">
            <div>您的檢舉報告傳送時</div>
            <div>似乎遇到了網路連線不穩定的情況，</div>
            <div>導致傳送失敗。</div>
            <div>請您再次嘗試發佈文章</div>
        </div>
    )
}

function ReSubmitBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            className={`bg-[#FF892A] rounded-[8px] text-white py-3 px-8 tracking-[4px] text-[20px]`}
            onClick={onClick}
        >
            重新送出檢舉
        </button>
    )
}
