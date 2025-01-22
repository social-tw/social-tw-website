import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from '@headlessui/react'
import { useToggle } from 'react-use'

export function SeeContent({
    onConfirm = () => {},
}: {
    onConfirm?: () => void
}) {
    const [isOpen, toggleIsOpen] = useToggle(false)

    const open = () => {
        toggleIsOpen(true)
    }

    const close = () => {
        toggleIsOpen(false)
    }

    return (
        <>
            <button
                className="text-xs font-medium underline text-white/80"
                onClick={open}
            >
                查看屏蔽內容
            </button>
            <ConfirmSeeContentDialog
                open={isOpen}
                onClose={close}
                onConfirm={onConfirm}
            />
        </>
    )
}

function ConfirmSeeContentDialog({
    open = false,
    onClose = () => {},
    onConfirm = () => {},
}: {
    open?: boolean
    onClose?: () => void
    onConfirm?: () => void
}) {
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
                            <p className="leading-7 tracking-wide">
                                親愛的用戶：
                                <br />
                                <br />
                                此被檢舉屏蔽的內容可能有涉及不當內容（如具歧視性言論、商業廣告、情色裸露、性暗示、違反政府法令、或其他有損社群秩序之內容），因此被屏蔽。請確認您是否依然想查看？
                            </p>
                            <div className="flex gap-4">
                                <button
                                    className="flex-1 text-lg font-bold text-white btn btn-primary"
                                    onClick={onClose}
                                >
                                    取消查看
                                </button>
                                <button
                                    className="flex-1 text-lg font-bold text-white btn btn-primary"
                                    onClick={onConfirm}
                                >
                                    查看屏蔽內容
                                </button>
                            </div>
                        </section>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
