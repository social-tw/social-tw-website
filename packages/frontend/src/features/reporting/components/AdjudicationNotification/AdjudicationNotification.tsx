import { ReactComponent as ArrowRight } from '@/assets/svg/arrow-right.svg'
import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import { ReactComponent as GavelIcon } from '@/assets/svg/gavel.svg'
import { useFetchReports } from '@/features/reporting'
import {
    CloseButton,
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from '@headlessui/react'
import { useToggle } from '@uidotdev/usehooks'
import AdjudicationForm from '../AdjudicationForm/AdjudicationForm'

function AdjudicationButton({ onClick = () => {} }: { onClick?: () => void }) {
    return (
        <button
            className="relative py-2 pl-12 pr-2 bg-black border border-white rounded-tl-lg rounded-tr rounded-bl rounded-br-lg lg:py-3 lg:pr-4 lg:pl-14 drop-shadow"
            onClick={onClick}
        >
            <GavelIcon className="absolute bottom-0 -left-3 w-[4.5rem] lg:w-[5.25rem] h-auto" />
            <div className="inline-flex flex-col items-start">
                <span className="text-base font-bold leading-tight tracking-normal text-white lg:tracking-wider lg:text-lg">
                    新檢舉案出現
                </span>
                <span className="text-xs font-medium leading-tight text-white lg:text-sm">
                    <ArrowRight className="inline-block w-3 lg:w-auto mr-0.5 lg:mr-1" />
                    立即前往評判！
                </span>
            </div>
        </button>
    )
}

function AdjudicationDialog({
    open = false,
    onClose = () => {},
}: {
    open?: boolean
    onClose?: () => void
}) {
    return (
        <Dialog className="relative z-50" open={open} onClose={onClose}>
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
                <DialogPanel className="relative w-11/12 max-w-xl p-0 shadow-base">
                    <CloseButton className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-[#051532]">
                        <CloseIcon />
                    </CloseButton>
                    <div className="max-h-[90vh] overflow-y-auto gradient-border-4 rounded-xl">
                        <AdjudicationForm />
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}

export default function AdjudicationNotification() {
    const [open, toggle] = useToggle(false)
    const { data } = useFetchReports()

    if (!data || data.length === 0) {
        return null
    }

    return (
        <div
            className="fixed z-20 right-4 bottom-28 lg:right-10 lg:bottom-20"
            data-testid="adjudication-notification"
        >
            <AdjudicationButton onClick={toggle} />
            <AdjudicationDialog open={open} onClose={() => toggle(false)} />
        </div>
    )
}
