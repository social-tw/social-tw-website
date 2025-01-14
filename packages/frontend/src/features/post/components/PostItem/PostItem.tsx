import { useUserState } from '@/features/core'
import { Avatar } from '@/features/shared'
import { PostStatus } from '@/types/Post'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import LinesEllipsis from 'react-lines-ellipsis'
import { Link } from 'react-router-dom'
import { useToggle } from 'react-use'
import { ActionMenu } from './ActionMenu'
import { BlockedMask } from './BlockedMask'
import { Downvote } from './Downvote'
import { LeaveComment } from './LeaveComment'
import { ReportedMask } from './ReportedMask'
import { Share } from './Share'
import { Upvote } from './Upvote'

export default function PostItem({
    epoch,
    epochKey,
    content = '',
    publishedAt = new Date(),
    postId = '',
    link,
    status = PostStatus.Success,
    compact = false,
    isInitiallyOpenComment = false,
}: {
    content: string
    epochKey: string
    epoch: number
    publishedAt: Date
    postId?: string
    link?: string
    status?: PostStatus
    compact?: boolean
    isInitiallyOpenComment?: boolean
}) {
    const { isShowBlockedMask } = useShowBlockedMask(epoch, epochKey, status)
    const { isShowReportedMask, toggleIsShowReportedMask } =
        useShowReportedMask(epoch, epochKey, status)

    if (isShowBlockedMask) {
        return <BlockedMask />
    }

    if (isShowReportedMask) {
        return (
            <ReportedMask
                postId={postId}
                onRemoveMask={() => toggleIsShowReportedMask(false)}
            />
        )
    }

    const dateLabel = formatDate(publishedAt)
    const subtitle = status === PostStatus.Pending ? '存取進行中' : dateLabel
    const item = (
        <article className="px-6 py-4 space-y-3 bg-white/90 rounded-xl shadow-base">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <Avatar name={epochKey} />
                    <span className="text-xs font-medium tracking-wide text-black/80">
                        {subtitle}
                    </span>
                </div>
                <ActionMenu postId={postId} />
            </header>
            <section className="text-sm font-medium tracking-wider text-black/90">
                {compact ? (
                    <LinesEllipsis
                        className="break-words whitespace-break-spaces"
                        text={content}
                        maxLine="4"
                        ellipsis="..."
                        component="p"
                    />
                ) : (
                    <p className="break-words whitespace-break-spaces">
                        {content}
                    </p>
                )}
            </section>
            <footer className="flex items-center gap-4">
                <Upvote postId={postId} />
                <Downvote postId={postId} />
                <LeaveComment
                    postId={postId}
                    isInitiallyOpenComment={isInitiallyOpenComment}
                />
                <Share postId={postId} />
            </footer>
        </article>
    )

    return (
        <div className="relative">
            {link ? <Link to={link}>{item}</Link> : item}
            {status === PostStatus.Pending && (
                <div className="absolute top-0 left-0 w-full h-full m-0 bg-white/50 rounded-xl" />
            )}
        </div>
    )
}

function useShowBlockedMask(
    epoch: number,
    epochKey: string,
    status: PostStatus,
) {
    const { userState } = useUserState()

    const isShowBlockedMask = useMemo(
        () =>
            status === PostStatus.Blocked &&
            userState &&
            !isMyEpochKey(userState, epoch, epochKey),
        [epoch, epochKey, status, userState],
    )

    return { isShowBlockedMask }
}

function useShowReportedMask(
    epoch: number,
    epochKey: string,
    status: PostStatus,
) {
    const { userState } = useUserState()

    const [isShowReportedMask, toggleIsShowReportedMask] = useToggle(false)

    useEffect(() => {
        const isShow =
            status === PostStatus.Reported &&
            userState &&
            !isMyEpochKey(userState, epoch, epochKey)
        toggleIsShowReportedMask(isShow)
    }, [epoch, epochKey, status, toggleIsShowReportedMask, userState])

    return { isShowReportedMask, toggleIsShowReportedMask }
}

function formatDate(date: Date) {
    const publishedTime = dayjs(date)
    return publishedTime.isBefore(dayjs(), 'day')
        ? publishedTime.format('YYYY/MM/DD')
        : publishedTime.fromNow()
}
