import { forwardRef } from "react";
import { createPortal } from "react-dom";
import CloseIcon from "../assets/close.svg";

interface DialogProps {
    children: React.ReactNode
    ariaLabel?: string
    open?: boolean
    onClose?: () => void
}

export default forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
    { children, open = false, onClose = () => {}, ariaLabel = '' },
    ref
) {
    return createPortal(
        (
            <div className="fixed top-0 left-0 z-40 flex items-center justify-center w-screen h-screen pointer-events-none">
                {open && <div className="absolute top-0 left-0 w-full h-full bg-black/50" />}
                <dialog
                    className="w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-white/90 shadow-base backdrop:bg-black/50"
                    ref={ref}
                    open={open}
                    aria-label={ariaLabel}
                >
                    <form className="flex justify-end p-3" method="dialog">
                        <button
                            className="btn btn-sm btn-circle btn-ghost text-[#051532]"
                            type="submit"
                            onClick={onClose}
                        >
                            <CloseIcon />
                        </button>
                    </form>
                    <form method="dialog">{children}</form>
                </dialog>
            </div>
        ),
        document.body
    )
})
