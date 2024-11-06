import { Dialog } from '@/features/shared'

interface InfoDialogProps {
    isOpen: boolean
    onClose: () => void
    onButtonClick: () => void
}

export function InfoDialog({
    isOpen,
    onClose,
    onButtonClick,
}: InfoDialogProps) {
    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <div className="py-8 px-12 flex flex-col items-center justify-between gap-16 w-full">
                <p className="mt-6 tracking-wide leading-7">
                    親愛的用戶：
                    <br />
                    <br />
                    Unirep Social
                    Taiwan為一去中心化的用戶自治管理社群平台，藉由透過檢舉不當內容的方式來
                    <span className="font-bold text-secondary">
                        維持社群的安全與健康
                    </span>
                    。
                    檢舉的流程會需要你選擇檢舉原因類別、填寫檢舉原因描述，並送出申請。
                    <span className="font-bold text-secondary">
                        提交的檢舉案將交由平台上的 5 位隨機用戶進行審核評判
                    </span>
                    。若檢舉案審核評判通過，你的聲譽分數會加 3
                    分，反之，則你的聲譽分數降 1 分。
                    <span className="font-bold text-secondary">
                        因此請審慎填寫檢舉案的內容
                    </span>
                    ，以幫助其他用戶進行評判，並避免聲譽分數被降低的風險。
                </p>
                <button
                    className="max-w-[280px] w-full h-14 rounded-lg text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%] bg-primary/90"
                    type="button"
                    onClick={onButtonClick}
                >
                    確認檢舉
                </button>
            </div>
        </Dialog>
    )
}
