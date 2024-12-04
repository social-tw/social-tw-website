import SubmittingImg from '@/assets/img/report-form-result-submitting.webp'
import { Backdrop } from '@/features/shared'
import { AiOutlineClose } from 'react-icons/ai'
import './reportFormSubmitting.css'

interface TransactionModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ReportFormSubmitting({
    isOpen,
    onClose,
}: TransactionModalProps) {
    return (
        <Backdrop isOpen={isOpen} position="fixed" background="bg-black/70">
            <div className="flex items-center justify-center min-h-full p-4">
                <div className="flex flex-col items-center gap-8 relative w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-transparent shadow-base">
                    <img
                        className="shrink-0 float-animation"
                        src={SubmittingImg}
                        alt="report-form-submitting"
                    />
                    <HintWording />
                    <button
                        onClick={onClose}
                        className="absolute text-white top-2 right-2 btn btn-sm btn-circle btn-ghost"
                        aria-label="Close"
                    >
                        <AiOutlineClose className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </Backdrop>
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
