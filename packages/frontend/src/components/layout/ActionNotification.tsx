import { useState } from 'react'
import { Link } from 'react-router-dom'
import CloseIcon from '@/assets/close.svg'
import PostIcon from '@/assets/post.svg'
import {
    ActionStatus,
    ActionType,
    latestActionSelector,
    pendingCountSelector,
    useActionStore,
} from '@/contexts/Actions'
import { Dialog } from '@headlessui/react'
import ActionTable, { getActionLink } from './ActionTable'

import type { Action } from '@/contexts/Actions'

function getActionMessage(type: ActionType) {
    const messages = {
        [ActionType.Post]: '貼文存取',
        [ActionType.Comment]: '留言存取',
        [ActionType.DeleteComment]: '刪除留言',
    }
    return messages[type]
}

function getActionSubject(type: ActionType) {
    const subjects = {
        [ActionType.Post]: '貼文',
        [ActionType.Comment]: '留言',
        [ActionType.DeleteComment]: '留言',
    }
    return subjects[type]
}

function getActionStatusLabel(action: Action) {
    const message = getActionMessage(action.type)
    const subject = getActionSubject(action.type)
    const actionLink = getActionLink(action)

    switch (action.status) {
        case ActionStatus.Pending: {
            return (
                <div className="flex items-center gap-2">
                    <PostIcon className="w-4 text-primary" />
                    <span className="text-xs text-primary">
                        {message}交易進行中
                    </span>
                    <progress className="flex-1 h-3 rounded-none progress progress-primary" />
                </div>
            )
        }
        case ActionStatus.Success: {
            return (
                <div className="flex items-center gap-2">
                    <PostIcon className="w-4 text-white" />
                    <span className="text-xs text-white">
                        {message}交易成功!
                    </span>
                    {action.type !== ActionType.DeleteComment && (
                        <Link
                            className="text-xs text-secondary"
                            to={actionLink}
                        >
                            前往查看{subject}
                        </Link>
                    )}
                </div>
            )
        }
        case ActionStatus.Failure: {
            return (
                <div className="flex items-center gap-2">
                    <PostIcon className="w-4 text-primary" />
                    <span className="text-xs text-primary">
                        {message}交易失敗!
                    </span>
                    <Link className="text-xs text-secondary" to={actionLink}>
                        前往查看{subject}
                    </Link>
                </div>
            )
        }
        default: {
            return null
        }
    }
}

export default function ActionNotification() {
    const lastestAction = useActionStore(latestActionSelector)

    const pendingCount = useActionStore(pendingCountSelector)

    const [isOpen, setIsOpen] = useState(false)

    if (!lastestAction) return null

    const statusLabel = getActionStatusLabel(lastestAction)

    return (
        <>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                {statusLabel}
                <button
                    className="px-1.5 py-px text-xs border text-primary border-primary leading-none"
                    data-testid="action-count-button"
                    onClick={() => setIsOpen(true)}
                >
                    {pendingCount}
                </button>
            </div>
            <Dialog
                className="relative z-40"
                open={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4">
                        <Dialog.Panel
                            className="relative w-full h-80 max-w-md overflow-hidden rounded-xl bg-black/90 px-7 pt-14 pb-7 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                            data-testid="actions-dialog"
                        >
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
