import { Avatar } from '@/features/shared'
import { CommentStatus } from '@/types/Comments'
import formatDate from '@/utils/helpers/formatDate'
import clsx from 'clsx'
import { nanoid } from 'nanoid'
import { CommentActionMenu } from './CommentActionMenu'

interface CommentProps {
    commentId?: string
    epochKey?: string
    content: string
    publishedAt: Date
    status: CommentStatus
    canDelete: boolean
    canReport: boolean
    onRepublish?: () => void
    onDelete?: () => void
}

export default function Comment({
    commentId,
    epochKey = nanoid(),
    content = '',
    publishedAt,
    status = CommentStatus.Success,
    canDelete = true,
    canReport = true,
    onRepublish = () => {},
    onDelete = () => {},
}: CommentProps) {
    return (
        <>
            <article
                id={commentId}
                className={clsx(
                    'pt-4 pb-6 space-y-2',
                    status !== CommentStatus.Success && 'opacity-30',
                )}
            >
                <header className="grid grid-cols-[1fr_auto] items-center">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <Avatar name={epochKey} />
                            <span className="text-xs font-medium tracking-wide text-white">
                                {status === CommentStatus.Failure
                                    ? '存取失敗，請再嘗試留言'
                                    : formatDate(publishedAt)}
                            </span>
                        </div>
                    </div>
                    <div>
                        {commentId && (
                            <CommentActionMenu
                                commentId={commentId}
                                onDelete={onDelete}
                                canDelete={canDelete}
                                canReport={canReport}
                            />
                        )}
                    </div>
                </header>
                <p className="text-sm font-medium text-white">{content}</p>
            </article>
            {status === CommentStatus.Failure && (
                <div className="mb-6">
                    <button
                        className="h-10 border-2 btn btn-sm btn-outline btn-primary"
                        onClick={onRepublish}
                    >
                        再次發佈這則留言
                    </button>
                </div>
            )}
        </>
    )
}
