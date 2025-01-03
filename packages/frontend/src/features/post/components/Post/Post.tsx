import { AUTH_ERROR_MESSAGE } from '@/constants/errorMessage'
import { useAuthStatus } from '@/features/auth'
import { useAuthCheck } from '@/features/auth/hooks/useAuthCheck/useAuthCheck'
import { useUserState } from '@/features/core'
import {
    LikeAnimation,
    VoteFailureDialog,
    usePostReportReason,
    useVoteStore,
} from '@/features/post'
import { useReputationScore } from '@/features/reporting'
import { Avatar } from '@/features/shared'
import { useCopy } from '@/features/shared/hooks/useCopy'
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import { PostStatus } from '@/types/Post'
import { VoteAction } from '@/types/Vote'
import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { useEffect, useMemo, useState } from 'react'
import LinesEllipsis from 'react-lines-ellipsis'
import { Link } from 'react-router-dom'
import { useBlockMask } from '../../hooks/useBlockMask/useBlockMask'
import { useReportMask } from '../../hooks/useReportMask/useReportMask'
import ShareLinkTransition from '../ShareLinkTransition/ShareLinkTransition'
import { PostActionMenu } from './PostActionMenu'
import { PostBlockedMask } from './PostBlockedMask'
import PostFooter from './PostFooter'
import { PostReportedMask } from './PostReportedMask'

export default function Post({
    id = '',
    epoch,
    epochKey,
    content = '',
    imageUrl,
    publishedAt = new Date(),
    commentCount = 0,
    upCount = 0,
    downCount = 0,
    compact = false,
    isMine = false,
    isReported = false,
    isBlocked = false,
    finalAction = null,
    votedNonce = null,
    votedEpoch = null,
    status = PostStatus.Success,
    onComment = () => {},
    onVote = async (voteType: VoteAction) => false,
}: {
    id?: string
    epoch?: number
    epochKey?: string
    content?: string
    imageUrl?: string
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
    compact?: boolean
    isMine?: boolean
    isReported?: boolean
    isBlocked?: boolean
    finalAction?: VoteAction | null
    votedNonce?: number | null
    votedEpoch?: number | null
    status?: PostStatus
    onComment?: () => void
    onVote?: (voteType: VoteAction) => Promise<boolean>
}) {
    const { userState } = useUserState()
    const publishedTime = dayjs(publishedAt)
    const publishedLabel = publishedTime.isBefore(dayjs(), 'day')
        ? publishedTime.format('YYYY/MM/DD')
        : publishedTime.fromNow()
    const subtitle =
        status === PostStatus.Pending ? '存取進行中' : publishedLabel

    const { isLoggedIn } = useAuthStatus()
    const checkAuth = useAuthCheck(AUTH_ERROR_MESSAGE.DEFAULT)

    const { votes } = useVoteStore()

    const voteState = useMemo(() => {
        return (
            votes[id] || {
                upCount: upCount,
                downCount: downCount,
                isMine: isMine,
                finalAction: finalAction,
                votedNonce: votedNonce,
                votedEpoch: votedEpoch,
            }
        )
    }, [
        downCount,
        finalAction,
        id,
        isMine,
        upCount,
        votes,
        votedNonce,
        votedEpoch,
    ])

    const { hasCopied, copyToClipboard } = useCopy()

    const [localUpCount, setLocalUpCount] = useState(upCount)
    const [localDownCount, setLocalDownCount] = useState(downCount)

    const [isShowAnimation, setIsShowAnimation] = useState(false)
    const { isShowReportMask, updateIsShowReportMask } = useReportMask(
        isReported,
        userState,
        epoch,
        epochKey,
    )
    const { isShowBlockMask } = useBlockMask(
        isBlocked,
        userState,
        epoch,
        epochKey,
    )

    const [imgType, setImgType] = useState<
        VoteAction.UPVOTE | VoteAction.DOWNVOTE
    >(VoteAction.UPVOTE)
    const [isAction, setIsAction] = useState(finalAction)
    const [isMineState, setIsMineState] = useState(isMine)
    const [isError, setIsError] = useState(false)

    const handleShareClick = () => {
        if (id) {
            const postLink = `${window.location.origin}/posts/${id}`
            copyToClipboard(postLink)
        }
    }

    // set isAction when finalAction is changed
    useEffect(() => {
        setIsMineState(isMine)
        setIsAction(finalAction)
    }, [isMine, finalAction])

    const { isValidReputationScore } = useReputationScore()
    const { reason } = usePostReportReason(id)

    const handleComment = async () => {
        try {
            await checkAuth()
            onComment()
        } catch (error) {
            console.error(error)
        }
    }

    const handleVote = async (voteType: VoteAction) => {
        if (!isLoggedIn) return
        if (!isValidReputationScore) {
            openForbidActionDialog()
            return
        }
        const success = await onVote(voteType)
        if (!success) {
            setIsError(true)
            return
        }

        setIsShowAnimation(true)
        setImgType(
            voteType === VoteAction.UPVOTE
                ? VoteAction.UPVOTE
                : VoteAction.DOWNVOTE,
        )
        setIsAction(voteType)
        setTimeout(() => setIsShowAnimation(false), 500)
    }

    useEffect(() => {
        setLocalUpCount(voteState.upCount)
        setLocalDownCount(voteState.downCount)
    }, [votes, id, upCount, downCount, voteState])

    useEffect(() => {
        setIsMineState(voteState.isMine)
        setIsAction(voteState.finalAction)
    }, [voteState])

    useEffect(() => {
        setIsMineState(isMine)
        setIsAction(finalAction)
    }, [isMine, finalAction])

    const postInfo = (
        <div className="space-y-3">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <Avatar name={epochKey ?? nanoid()} />
                    <span className="text-xs font-medium tracking-wide text-black/80">
                        {subtitle}
                    </span>
                </div>
                <PostActionMenu postId={id} />
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
        </div>
    )

    if (isShowReportMask) {
        return (
            <PostReportedMask
                onRemove={() => updateIsShowReportMask(false)}
                reason={reason}
            />
        )
    }

    return (
        <article className="relative flex bg-white/90 rounded-xl shadow-base">
            {isShowBlockMask && <PostBlockedMask />}
            {<LikeAnimation isLiked={isShowAnimation} imgType={imgType} />}
            {<ShareLinkTransition isOpen={hasCopied} />}
            <div className="flex-1 px-6 py-4 space-y-3">
                {compact && status === PostStatus.Success ? (
                    <Link to={`/posts/${id}`}>{postInfo}</Link>
                ) : (
                    postInfo
                )}
                {!compact && imageUrl && (
                    <section className="hidden rounded-xl shadow-base">
                        <img className="w-full" src={imageUrl} alt={content} />
                    </section>
                )}
                <PostFooter
                    isLoggedIn={isLoggedIn}
                    isMineState={isMineState}
                    countUpVote={localUpCount}
                    countDownVote={localDownCount}
                    countComment={commentCount}
                    voteAction={isAction}
                    handleVote={handleVote}
                    handleComment={handleComment}
                    handleShare={handleShareClick}
                />
            </div>
            {compact && imageUrl && (
                <div className="max-w-[150px] rounded-xl shadow-base hidden">
                    <img
                        className="object-cover w-full h-full"
                        src={imageUrl}
                        alt={content}
                    />
                </div>
            )}
            {status === PostStatus.Pending && (
                <div className="absolute top-0 left-0 w-full h-full bg-white/50 rounded-xl" />
            )}
            <VoteFailureDialog
                isOpen={isError}
                onClose={() => setIsError(false)}
            />
        </article>
    )
}
