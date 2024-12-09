import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'

export default function ConfirmationDialog({
    open,
    onConfirm,
    onCancel,
    onClose,
}: {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
    onClose: () => void
}) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative w-11/12 max-w-md p-8 bg-white shadow-lg rounded-xl">
                {/* Close Button */}
                <button className="absolute top-4 right-4" onClick={onClose}>
                    <CloseIcon className="w-6 h-6 text-[#051532] hover:text-black" />
                </button>

                {/* Title and Message */}
                <p className="text-base font-medium leading-relaxed tracking-wider md:leading-slightly-loose">
                    親愛的用戶：
                    <br />
                    <br />
                    你確定要放棄這個評判機會嗎？
                    協助評判不僅能與其他用戶一同維護平台的自治與健康，也能提高聲譽分數1分
                </p>

                {/* Action Buttons */}
                <div className="flex mt-6 space-x-4">
                    <button
                        className="flex-1 py-2 font-bold text-white bg-orange-500 rounded-md hover:bg-orange-600"
                        onClick={onConfirm}
                    >
                        確認放棄
                    </button>
                    <button
                        className="flex-1 py-2 font-bold text-white bg-orange-500 rounded-md hover:bg-orange-600"
                        onClick={onCancel}
                    >
                        前往協助評判
                    </button>
                </div>
            </div>
        </div>
    )
}
