import { ReactComponent as ActionIcon } from '@/assets/svg/action.svg'
import {
    ActionStatus,
    ActionType,
    getActionMessage,
    getActionSubject,
    latestActionSelector,
    pendingCountSelector,
    useActionStore,
    type Action,
} from '@/features/core'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ActionDialog from './ActionDialog'

export default function ActionTracker() {
    const lastestAction = useActionStore(latestActionSelector)

    const pendingCount = useActionStore(pendingCountSelector)

    const actionStatus = getActionStatus(lastestAction)

    const [open, setOpen] = useState(false)

    return (
        <>
            <div
                className="grid grid-cols-[1fr_auto] items-center gap-2"
                data-tour-step="3"
            >
                <div>{actionStatus}</div>
                <button
                    className="px-1.5 py-px text-xs border text-primary border-primary leading-none"
                    onClick={() => setOpen(true)}
                >
                    {pendingCount}
                </button>
            </div>
            <ActionDialog open={open} onClose={() => setOpen(false)} />
        </>
    )
}

function getActionStatus(action: Action | undefined) {
    if (!action) {
        return null
    }

    const message = getActionMessage(action.type)
    const subject = getActionSubject(action.type)
    const actionLink = getActionLink(action)

    switch (action.status) {
        case ActionStatus.Pending: {
            return (
                <div className="flex items-center gap-2">
                    <ActionIcon className="w-4 text-primary" />
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
                    <ActionIcon className="w-4 text-primary" />
                    <span className="text-xs text-primary">
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
                    <ActionIcon className="w-4 text-primary" />
                    <span className="text-xs text-primary">
                        {message}交易失敗!
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

function getActionLink(action: Action) {
    if (action.type === ActionType.Post) {
        if (action.status === ActionStatus.Success) {
            return `/posts/${action.data.postId}`
        } else {
            return `/?failedPostId=${action.id}`
        }
    }
    if (action.type === ActionType.Comment) {
        return `/posts/${action.data.postId}?fc=${action.data.commentId}`
    }
    return '#'
}

function isActionLinkExistWhenSuccess(action: Action) {
    return action.type === ActionType.Post || action.type === ActionType.Comment
}

function isActionLinkExistWhenFailure(action: Action) {
    return (
        action.type === ActionType.Post ||
        action.type === ActionType.Comment ||
        action.type === ActionType.DeleteComment
    )
}
