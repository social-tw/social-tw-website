import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import CloseIcon from '../../assets/close.svg'
import PostIcon from '../../assets/post.svg'
import ActionTable from './ActionTable'

export default function ActionNotification() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <PostIcon className="w-4 text-primary" />
                <span className="text-xs text-primary">貼文存取交易進行中</span>
                <progress className="flex-1 h-3 rounded-none progress progress-primary" />
                <button
                    className="px-1.5 py-px text-xs border text-primary border-primary leading-none"
                    onClick={() => setIsOpen(true)}
                >
                    2
                </button>
            </div>
            <Dialog
                className="relative z-40"
                open={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4">
                        <Dialog.Panel className="relative w-full h-80 max-w-md overflow-hidden rounded-xl bg-black/90 px-7 pt-14 pb-7 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <button
                                className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-white/90"
                                type="submit"
                                onClick={() => setIsOpen(false)}
                            >
                                <CloseIcon />
                            </button>
                            <ActionTable />
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}
