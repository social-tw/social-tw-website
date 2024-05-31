import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import LinesEllipsis from 'react-lines-ellipsis'
import Comment from '@/assets/img/comment.png'
import Downvote from '@/assets/img/downvote.png'
import Upvote from '@/assets/img/upvote.png'
import { useAuthStatus } from '@/features/auth'
import {
    LikeAnimation,
    VoteFailureDialog,
    useVotes,
    usePostStore,
    useVoteStore,
} from '@/features/post'
import { Avatar } from '@/features/shared'
import { PostStatus } from '@/types/Post'
import { VoteAction } from '@/types/Vote'

export default function Post({
    id = '',
    epochKey,
    content = '',
    imageUrl,
    publishedAt = new Date(),
    commentCount = 0,
    upCount = 0,
    downCount = 0,
    compact = false,
    isMine = false,
    finalAction = null,
    votedNonce = null,
    votedEpoch = null,
    status = PostStatus.Success,
    onComment = () => {},
}: {
    id?: string
    epochKey?: string
    content?: string
    imageUrl?: string
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
    compact?: boolean
    isMine?: boolean
    finalAction?: VoteAction | null
    votedNonce?: number | null
    votedEpoch?: number | null
    status?: PostStatus
    onComment?: () => void
}) {
    const publishedTime = dayjs(publishedAt)
    const publishedLabel = publishedTime.isBefore(dayjs(), 'day')
        ? publishedTime.format('YYYY/MM/DD')
        : publishedTime.fromNow()
    const subtitle =
        status === PostStatus.Pending ? '存取進行中' : publishedLabel

    const { isLoggedIn } = useAuthStatus()

    const { createVote } = useVotes()
    // 'upvote', 'downvote', or null
    const { votes, updateVote } = useVoteStore()
    const voteState = useMemo(() => {
        return (
            votes[id] || {
                upCount: upCount,
                downCount: downCount,
                isMine: isMine,
                finalAction: finalAction,
            }
        )
    }, [downCount, finalAction, id, isMine, upCount, votes])

    const [localUpCount, setLocalUpCount] = useState(upCount)
    const [localDownCount, setLocalDownCount] = useState(downCount)

    const [show, setShow] = useState(false)
    const [imgType, setImgType] = useState<
        VoteAction.UPVOTE | VoteAction.DOWNVOTE
    >(VoteAction.UPVOTE)
    const [isAction, setIsAction] = useState(finalAction)
    const [isMineState, setIsMineState] = useState(isMine)
    const updateVoteCount = usePostStore((state) => state.updateVoteCount)
    const [isVotedNonce, setIsVotedNonce] = useState(votedNonce)
    const [isVotedEpoch, setIsVotedEpoch] = useState(votedEpoch)
    const [isError, setIsError] = useState(false)

    // set isAction when finalAction is changed
    useEffect(() => {
        setIsMineState(isMine)
        setIsAction(finalAction)
        setIsVotedNonce(votedNonce)
        setIsVotedEpoch(votedEpoch)
    }, [isMine, finalAction, votedNonce, votedEpoch])

    const handleVote = async (voteType: VoteAction) => {
        let action: VoteAction
        let success = false
        let newUpCount = voteState.upCount
        let newDownCount = voteState.downCount
        let newIsMine = true
        const newFinalAction = voteType

        if (voteState.isMine) {
            const cancelAction =
                voteState.finalAction === VoteAction.UPVOTE
                    ? VoteAction.CANCEL_UPVOTE
                    : VoteAction.CANCEL_DOWNVOTE

            success = await createVote({ id, voteAction: cancelAction })

            if (success) {
                if (cancelAction === VoteAction.CANCEL_UPVOTE) {
                    newUpCount -= 1
                } else {
                    newDownCount -= 1
                }
                newIsMine = false
                updateVoteCount(id, newUpCount, newDownCount)
            } else {
                setIsError(true)
                return
            }
        }

        // if not exist vote, create vote
        if (!voteState.isMine || voteState.finalAction !== voteType) {
            action = voteType
            success = await createVote({ id, voteAction: action })

            if (success) {
                setShow(true)
                setImgType(
                    voteType === VoteAction.UPVOTE
                        ? VoteAction.UPVOTE
                        : VoteAction.DOWNVOTE,
                )

                if (action === VoteAction.UPVOTE) {
                    newUpCount += 1
                } else {
                    newDownCount += 1
                }
                setIsAction(action)
                updateVoteCount(id, newUpCount, newDownCount)
                newIsMine = true
                setIsAction(newFinalAction)
            } else {
                setIsError(true)
                return
            }
        }
        setIsMineState(newIsMine)
        updateVote(
            id,
            newUpCount,
            newDownCount,
            newIsMine,
            newFinalAction,
            isVotedNonce,
            isVotedEpoch,
        )
        setTimeout(() => setShow(false), 500)
    }

    useEffect(() => {
        const voteState = votes[id] || {
            upCount: upCount,
            downCount: downCount,
            isMine: isMine,
            finalAction: finalAction,
            votedNonce: votedNonce,
            votedEpoch: votedEpoch,
        }

        setLocalUpCount(voteState.upCount)
        setLocalDownCount(voteState.downCount)
    }, [votes, id, isMine, finalAction, upCount, downCount])

    useEffect(() => {
        setLocalUpCount(voteState.upCount)
        setLocalDownCount(voteState.downCount)
        setIsMineState(voteState.isMine)
        setIsAction(voteState.finalAction)
        setIsVotedNonce(voteState.votedNonce)
        setIsVotedEpoch(voteState.votedEpoch)
    }, [voteState])

    const postInfo = (
        <div className="space-y-3">
            <header className="flex items-center gap-4">
                <Avatar name={epochKey ?? nanoid()} />
                <span className="text-xs font-medium tracking-wide text-black/80">
                    {subtitle}
                </span>
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

    return (
        <article className="relative flex bg-white/90 rounded-xl shadow-base">
            {<LikeAnimation isLiked={show} imgType={imgType} />}
            <div className="flex-1 p-4 space-y-3">
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
                <footer className="flex items-center gap-4">
                    <div
                        className={`flex items-center gap-1`}
                        onClick={() => handleVote(VoteAction.UPVOTE)}
                        style={{
                            cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                        }}
                    >
                        <div
                            className={`${
                                isMineState && isAction === VoteAction.UPVOTE
                                    ? 'border-4 border-white rounded-full'
                                    : ''
                            }`}
                        >
                            <img
                                className="w-5 h-5"
                                src={Upvote}
                                alt="upvote"
                            />
                        </div>
                        <span className="text-xs font-medium tracking-wide text-black/80">
                            {localUpCount}
                        </span>
                    </div>
                    <div
                        className={`flex items-center gap-1`}
                        onClick={() => handleVote(VoteAction.DOWNVOTE)}
                        style={{
                            cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                        }}
                    >
                        <div
                            className={`${
                                isMineState && isAction === VoteAction.DOWNVOTE
                                    ? 'border-4 border-white rounded-full'
                                    : ''
                            }`}
                        >
                            <img
                                className="w-5 h-5"
                                src={Downvote}
                                alt="downvote"
                            />
                        </div>
                        <span className="text-xs font-medium tracking-wide text-black/80">
                            {localDownCount}
                        </span>
                    </div>
                    <button
                        className="flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                        disabled={!onComment}
                        onClick={onComment}
                    >
                        <img
                            className="w-5 h-5"
                            src={Comment}
                            alt="comment"
                            style={{
                                cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                            }}
                        />
                        <span className="text-xs font-medium tracking-wide text-black/80">
                            {commentCount}
                        </span>
                    </button>
                </footer>
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
