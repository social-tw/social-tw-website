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
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full relative">
                {/* Close Button */}
                <button className="absolute top-4 right-4" onClick={onClose}>
                    <CloseIcon className="w-6 h-6 text-gray-500 hover:text-black" />
                </button>

                {/* Title and Message */}
                <p className="text-lg font-bold mb-4">親愛的用戶：</p>
                <p className="text-base text-gray-700 leading-relaxed">
                    你確定要放棄這個評判機會嗎？協助評判不僅能與其他用戶一同維護平台的自治與健康，
                    也能提高聲譽分數 1 分。
                </p>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-4">
                    <button
                        className="flex-1 py-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600"
                        onClick={onConfirm}
                    >
                        確認放棄
                    </button>
                    <button
                        className="flex-1 py-2 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600"
                        onClick={onCancel}
                    >
                        前往協助評判
                    </button>
                </div>
            </div>
        </div>
    )
}
