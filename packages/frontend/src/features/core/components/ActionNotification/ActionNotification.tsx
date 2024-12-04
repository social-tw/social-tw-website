import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import { ReactComponent as PostIcon } from '@/assets/svg/post.svg'
import {
    ActionStatus,
    ActionTable,
    ActionType,
    getActionMessage,
    getActionSubject,
    latestActionSelector,
    pendingCountSelector,
    useActionStore,
    type Action,
} from '@/features/core'
import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function getActionLink(action: Action) {
    if (action.type === ActionType.Post) {
        if (action.status === ActionStatus.Success) {
            return `/posts/${action.data.postId}`
        } else {
            return `/?failedPostId=${action.id}`
        }
    }
    if (
        action.type === ActionType.Comment ||
        action.type === ActionType.DeleteComment
    ) {
        return `/posts/${action.data.postId}#${action.data.commentId}`
    }
    return '#'
}

function isActionLinkExistWhenSuccess(action: Action) {
    return (
        action.type === ActionType.Post ||
        action.type === ActionType.Comment ||
        action.type === ActionType.UpVote ||
        action.type === ActionType.DownVote
    )
}

function isActionLinkExistWhenFailure(action: Action) {
    return (
        action.type === ActionType.Post ||
        action.type === ActionType.Comment ||
        action.type === ActionType.DeleteComment
    )
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
                    {isActionLinkExistWhenSuccess(action) && (
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
                        {message}交易未成功!
                    </span>
                    {isActionLinkExistWhenFailure(action) && (
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
        default: {
            return null
        }
    }
}

export default function ActionNotification() {
    const latestAction = useActionStore(latestActionSelector)

    const pendingCount = useActionStore(pendingCountSelector)

    const [isOpen, setIsOpen] = useState(false)

    if (!latestAction) return null

    const statusLabel = getActionStatusLabel(latestAction)

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
                    <div className="min-h-full px-4 pt-[15.75rem] md:py-4 md:flex md:justify-center md:items-center">
                        <Dialog.Panel
                            className="relative w-full max-w-md mx-auto overflow-hidden rounded-xl bg-black/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                            data-testid="actions-dialog"
                        >
                            <div className="px-6 py-4">
                                <button
                                    className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost text-white/90"
                                    type="submit"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="px-6 pb-6">
                                <ActionTable onClose={() => setIsOpen(false)} />
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}
