import { Dialog } from '@/features/shared'

interface DatesLimitDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function DatesLimitDialog({
    isOpen,
    onClose,
}: DatesLimitDialogProps) {
    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col gap-6 px-6 py-12 md:px-12">
                <div>親愛的用戶：</div>
                <div>
                    「貼文」、「留言紀錄」、「讚/倒讚」的歷史紀錄僅能至多查詢 30 天區間的紀錄，您所選擇的日期區間超過 30 天，請重新選擇日期區間。
                </div>
                <button
                    className={`bg-[#FF892A] w-full rounded-lg text-white py-3`}
                    onClick={onClose}
                >
                    重新選擇日期區間
                </button>
            </div>
        </Dialog>
    )
}
