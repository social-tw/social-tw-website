import ThumbUp from '@/assets/img/thumb-up.png'
import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from '@headlessui/react'

export default function CheckInSuccess({
    open = false,
    onClose = () => {},
    onCheckout = () => {},
}: {
    open?: boolean
    onClose?: () => void
    onCheckout?: () => void
}) {
    return (
        <Dialog className="relative z-50" open={open} onClose={onClose}>
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
                <DialogPanel className="relative w-11/12 max-w-xl p-0 shadow-base">
                    <CloseButton className="absolute text-white top-4 right-4 btn btn-sm btn-circle btn-ghost">
                        <CloseIcon />
                    </CloseButton>
                        <div className="space-y-8">
                            <hgroup className="pt-52">
                                <div className="relative mx-auto w-fit">
                                    <img
                                        src={ThumbUp}
                                        alt="thumn up"
                                        className="absolute object-cover w-24 h-24 -top-28 -right-12 max-w-fit"
                                    />
                                    <img
                                        src={ThumbUp}
                                        alt="thumn up"
                                        className="absolute object-cover top-6 -right-24 w-14 h-14 max-w-fit"
                                    />
                                    <img
                                        src={ThumbUp}
                                        alt="thumn up"
                                        className="absolute object-cover w-12 h-12 -top-8 -left-12 max-w-fit"
                                    />
                                    <h3 className="font-bold leading-loose tracking-wider text-center text-white w-fit">
                                        <span className="text-6xl">+</span>
                                        <span className="text-8xl">1</span>
                                    </h3>
                                </div>
                                <p className="text-base font-normal leading-loose tracking-wider text-center text-white">
                                    恭喜你的聲譽分數增加了 1 分！
                                </p>
                            </hgroup>
                            <div className="flex justify-center">
                                <button
                                    className="px-8 mx-auto text-xl font-bold tracking-widest text-white btn btn-secondary h-14"
                                    onClick={onCheckout}
                                    >
                                    前往查看聲譽分數紀錄
                                </button>
                            </div>
                        </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
