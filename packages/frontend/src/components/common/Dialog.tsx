import { forwardRef } from "react";
import CloseIcon from "@/assets/close.svg";
import { Dialog as HeadlessDialog } from "@headlessui/react";
import Backdrop from "./Backdrop";

interface DialogProps {
    children: React.ReactNode
    isOpen?: boolean
    onClose?: () => void
}

const Dialog = forwardRef<HTMLDivElement, DialogProps>((props, ref) => {
    const { children, isOpen = false, onClose = () => { } } = props;

    return (
        <HeadlessDialog
            className="relative z-40"
            open={isOpen}
            onClose={onClose}
        >
            <Backdrop isOpen={isOpen} position="fixed" background="bg-black/70">
                <div className="flex items-center justify-center min-h-full p-4">
                    <HeadlessDialog.Panel
                        className="relative block w-11/12 max-w-xl p-0 pointer-events-auto rounded-xl bg-white/90 shadow-base"
                        as='dialog'
                        ref={ref}
                    >
                        <button
                            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-[#051532]"
                            type="submit"
                            onClick={onClose}
                        >
                            <CloseIcon />
                        </button>
                        {children}
                    </HeadlessDialog.Panel>
                </div>
            </Backdrop>
        </HeadlessDialog>
    );
});

export default Dialog;
