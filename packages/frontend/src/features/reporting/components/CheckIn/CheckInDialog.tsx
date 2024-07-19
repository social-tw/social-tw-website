import CheckInCampaign from '@/assets/img/check-in-campaign.png'
import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from '@headlessui/react'

export default function CheckInDialog({
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
                <DialogPanel className="relative w-11/12 max-w-sm p-0 shadow-base">
                    <CloseButton className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-white/70">
                        <CloseIcon />
                    </CloseButton>
                    <div className="max-h-[90vh] overflow-y-auto rounded-xl">
                        <section className="px-6 py-10 space-y-10 md:p-14">
                            <button onClick={onConfirm}>
                                <img
                                    className="w-full h-auto"
                                    src={CheckInCampaign}
                                    alt="check in campaign"
                                />
                            </button>
                        </section>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
