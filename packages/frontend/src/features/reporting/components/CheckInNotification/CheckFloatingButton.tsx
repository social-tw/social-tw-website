import CheckInPromotion from '@/assets/img/check-in-promotion.png'
import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'

export default function CheckInFloatingButton({
    show = false,
    onConfirm = () => {},
    onCancel = () => {},
}: {
    show?: boolean
    onConfirm?: () => void
    onCancel?: () => void
}) {
    if (!show) {
        return null
    }

    return (
        <div className="relative">
            <button type="button" onClick={onConfirm}>
                <img
                    className="h-auto w-36"
                    src={CheckInPromotion}
                    alt="check in campaign"
                />
            </button>
            <button
                className="w-6 h-6 rounded-full flex justify-center items-center absolute top-1 -right-3 z-10 bg-white text-[#5B5959]"
                type="button"
                onClick={onCancel}
            >
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
    )
}
