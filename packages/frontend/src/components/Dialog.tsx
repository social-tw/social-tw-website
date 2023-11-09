import { forwardRef, ReactNode } from 'react';
import CloseIcon from '../assets/close.svg';

interface DialogProps {
    children: ReactNode;
    ariaLabel?: string;
    open?: boolean;
    onClose?: () => void;
}

export default forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
    { children, open = false, onClose = () => {}, ariaLabel = '' },
    ref,
) {
    return (
        <dialog
            className="w-11/12 max-w-xl p-0 rounded-xl bg-white/90 shadow-base backdrop:bg-black/50"
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
    );
});
