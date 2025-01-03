import { Avatar } from '@/features/shared'
import { CommentStatus } from '@/types/Comments'
import formatDate from '@/utils/helpers/formatDate'
import clsx from 'clsx'
import { nanoid } from 'nanoid'
import { useEffect, useRef } from 'react'
import { useTimeoutFn, useToggle } from 'react-use'
import { CommentActionMenu } from './CommentActionMenu'
import { CommentBlockedMask } from './CommentBlockedMask'
import { CommentReportedMask } from './CommentReportedMask'

interface CommentProps {
    postId: string
    commentId?: string
    epochKey?: string
    content: string
    publishedAt: Date
    isFocused?: boolean
    isReported?: boolean
    isBlocked?: boolean
    status: CommentStatus
    canDelete: boolean
    canReport: boolean
    onRepublish?: () => void
    onDelete?: () => void
    onFocusEnd?: () => void
}

export default function Comment({
    postId,
    commentId,
    epochKey = nanoid(),
    content = '',
    publishedAt,
    isFocused = false,
    isReported = false,
    isBlocked = false,
    status = CommentStatus.Success,
    canDelete = true,
    canReport = true,
    onRepublish = () => {},
    onDelete = () => {},
    onFocusEnd = () => {},
}: CommentProps) {
    const { ref, focused } = useCommentFocused(isFocused, onFocusEnd)

    if (isBlocked) {
        return <CommentBlockedMask />
    }

    if (isReported) {
        return <CommentReportedMask />
    }

    return (
        <article
            ref={ref}
            className="relative pt-4 pb-6 border-2 border-transparent"
        >
            <div
                className={clsx(
                    'absolute top-0 left-0 -z-10 w-[calc(100%_+_24px)] h-full -ml-3 rounded-xl ring-2 ring-secondary transition-opacity duration-500',
                    focused ? 'opacity-100' : 'opacity-0',
                )}
            />
            <div
                className={clsx(
                    status !== CommentStatus.Success && 'opacity-30',
                )}
            >
                <header className="grid grid-cols-[1fr_auto] items-center mb-2">
                    <div className="flex items-center gap-5">
                        <Avatar name={epochKey} />
                        <span className="text-xs font-medium tracking-wide text-white">
                            {status === CommentStatus.Failure
                                ? '存取失敗，請再嘗試留言'
                                : formatDate(publishedAt)}
                        </span>
                    </div>
                    {commentId && (
                        <CommentActionMenu
                            postId={postId}
                            commentId={commentId}
                            onDelete={onDelete}
                            canDelete={canDelete}
                            canReport={canReport}
                        />
                    )}
                </header>
                <p className="text-sm font-medium text-white whitespace-break-spaces">
                    {content}
                </p>
            </div>
            {status === CommentStatus.Failure && (
                <footer className="mt-6">
                    <button
                        className="h-10 border-2 btn btn-sm btn-outline btn-primary"
                        onClick={onRepublish}
                    >
                        再次發佈這則留言
                    </button>
                </footer>
            )}
        </article>
    )
}

function useCommentFocused(isFocused: boolean, onFocusEnd = () => {}) {
    const ref = useRef<HTMLElement>(null)

    const [focused, toggleFocused] = useToggle(isFocused)

    const [, cancel, reset] = useTimeoutFn(() => {
        toggleFocused(false)
        onFocusEnd()
    }, 5000)

    useEffect(() => {
        if (isFocused) {
            toggleFocused(isFocused)
            reset()
            ref.current?.scrollIntoView()
        }

        return () => {
            cancel()
        }
    }, [cancel, isFocused, reset, toggleFocused])

    return {
        ref,
        focused,
    }
}
