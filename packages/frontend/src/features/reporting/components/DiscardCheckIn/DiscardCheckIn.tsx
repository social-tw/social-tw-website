import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from '@headlessui/react'
import { useNotifyCheckIn } from '../../hooks/useNotifyCheckIn/useNotifyCheckIn'

export default function DiscardCheckIn({
    open = false,
    onClose = () => {},
    onCheckIn = () => {},
}: {
    open?: boolean
    onClose?: () => void
    onCheckIn?: () => void
}) {
    const { discard } = useNotifyCheckIn()

    return (
        <Dialog className="relative z-50" open={open} onClose={onClose}>
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
                <DialogPanel className="relative w-11/12 max-w-xl p-0 shadow-base">
                    <CloseButton className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-[#051532]">
                        <CloseIcon />
                    </CloseButton>
                    <div className="max-h-[90vh] overflow-y-auto rounded-xl">
                        <section className="px-6 py-10 space-y-10 bg-white md:p-14">
                            <p>
                                親愛的用戶：
                                <br />
                                <br />
                                由於您的聲譽分數低於0分，因此有這個每日簽到活動幫助您提升聲譽分數。您確定要放棄本日的每日簽到機會嗎？取消後得到隔日才會有下一次的每日簽到活動。
                            </p>
                            <div className="flex gap-4">
                                <button
                                    className="flex-1 text-lg font-bold text-white btn btn-primary"
                                    onClick={discard}
                                >
                                    確認放棄
                                </button>
                                <button
                                    className="flex-1 text-lg font-bold text-white btn btn-secondary"
                                    onClick={onCheckIn}
                                >
                                    前往活動
                                </button>
                            </div>
                        </section>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
