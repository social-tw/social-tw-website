import { openTour } from '@/features/core'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { useAuthStatus } from '../../hooks/useAuthStatus/useAuthStatus'
import SignupProgress from '../SignupProgress/SignupProgress'

export default function SignupPending() {
    const { isSigningUp } = useAuthStatus()

    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (isSigningUp) {
            setOpen(true)

            setTimeout(() => {
                setOpen(false)
                openTour()
            }, 2000)
        }
    }, [isSigningUp])

    return (
        <Dialog className="relative z-50" open={open} onClose={() => {}}>
            <DialogBackdrop className="fixed inset-0 bg-black/70" />
            <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
                <DialogPanel className="relative p-0 w-85 shadow-base">
                    <div className="flex flex-col justify-center h-48 overflow-y-auto rounded-xl bg-white/90">
                        <SignupProgress />
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
