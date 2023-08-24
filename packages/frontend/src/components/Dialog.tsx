import { forwardRef, ReactNode } from 'react'
import CloseIcon from '../assets/close.svg'

interface DialogProps {
    children: ReactNode
    open?: boolean
    onClose?: () => void
}

export default forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
    { children, open = false, onClose = () => {} },
    ref
) {
    return (
        <dialog
            className="w-11/12 max-w-xl p-0 rounded-xl bg-white/90 shadow-base backdrop:bg-black/50"
            ref={ref}
            open={open}
        >
            <form className="flex justify-end p-3" method="dialog">
                <button
                    className="btn btn-sm btn-circle btn-ghost text-[#051532]"
                    type="submit"
                >
                    <CloseIcon />
                </button>
            </form>
            <form method="dialog">{children}</form>
        </dialog>
    )
})
