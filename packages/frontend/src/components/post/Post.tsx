import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import React, { useEffect, useState } from 'react'
import LinesEllipsis from 'react-lines-ellipsis'
import { Link } from 'react-router-dom'
import Avatar from '@/components/common/Avatar'
import { PostStatus, VoteAction } from '@/types'
import Comment from '../../assets/comment.png'
import Downvote from '../../assets/downvote.png'
import Upvote from '../../assets/upvote.png'
import { useUser } from '../../contexts/User'
import useVotes from '../../hooks/useVotes'
import LikeAnimation from '../ui/animations/LikeAnimation'
import useStore from '../../store/usePostStore'
import useVoteStore from '../../store/useVoteStore'
import VoteFailureDialog from '@/components/post/VoteFailureDialog'

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
    status?: PostStatus
    onComment?: () => void
}) {
    const publishedTime = dayjs(publishedAt)
    const publishedLabel = publishedTime.isBefore(dayjs(), 'day')
        ? publishedTime.format('YYYY/MM/DD')
        : publishedTime.fromNow()

    const subtitle =
        status === PostStatus.Pending ? '存取進行中' : publishedLabel

    const { isLogin } = useUser()
    const { create } = useVotes()
    // 'upvote', 'downvote', or null
    const { votes, updateVote } = useVoteStore()
    const voteState = votes[id] || {
        upCount: upCount,
        downCount: downCount,
        isMine: isMine,
        finalAction: finalAction,
    }

    const [localUpCount, setLocalUpCount] = useState(upCount)
    const [localDownCount, setLocalDownCount] = useState(downCount)

    const [show, setShow] = useState(false)
    const [imgType, setImgType] = useState<
        VoteAction.UPVOTE | VoteAction.DOWNVOTE
    >(VoteAction.UPVOTE)
    const [isAction, setIsAction] = useState(finalAction)
    // ignore next event
    const [ignoreNextEvent, setIgnoreNextEvent] = useState(false)
    const [isMineState, setIsMineState] = useState(isMine)
    const updateVoteCount = useStore((state) => state.updateVoteCount)
    const [isError, setIsError] = useState(false)

    // set isAction when finalAction is changed
    useEffect(() => {
        setIsMineState(isMine)
        setIsAction(finalAction)
    }, [isMine, finalAction])

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

    const handleVote = async (voteType: VoteAction) => {
        let action: VoteAction
        let success = false
        let newUpCount = voteState.upCount
        let newDownCount = voteState.downCount
        let newIsMine = true
        const newFinalAction = voteType
        if (ignoreNextEvent) return

        // if exist vote, cancel vote
        if (voteState.isMine) {
            setIgnoreNextEvent(true)
            const cancelAction =
                voteState.finalAction === VoteAction.UPVOTE
                    ? VoteAction.CANCEL_UPVOTE
                    : VoteAction.CANCEL_DOWNVOTE

            success = await create(id, cancelAction)

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
                setIgnoreNextEvent(false)
                return
            }
        }

        // if not exist vote, create vote
        if (!voteState.isMine || voteState.finalAction !== voteType) {
            action = voteType
            setIgnoreNextEvent(true)
            success = await create(id, action)

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
                setIgnoreNextEvent(false)
                return
            }
            setTimeout(() => setIgnoreNextEvent(false), 500)
        }
        setIsMineState(newIsMine)
        updateVote(id, newUpCount, newDownCount, newIsMine, newFinalAction)
        setIgnoreNextEvent(false)
        setTimeout(() => setShow(false), 500)
    }

    useEffect(() => {
        const voteState = votes[id] || {
            upCount: upCount,
            downCount: downCount,
            isMine: isMine,
            finalAction: finalAction,
        }

        setLocalUpCount(voteState.upCount)
        setLocalDownCount(voteState.downCount)
    }, [votes, id, isMine, finalAction, upCount, downCount])

    useEffect(() => {
        setLocalUpCount(voteState.upCount)
        setLocalDownCount(voteState.downCount)
        setIsMineState(voteState.isMine)
        setIsAction(voteState.finalAction)
    }, [voteState])

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
                        <img className="w-full" src={imageUrl} alt="image" />
                    </section>
                )}
                <footer className="flex items-center gap-4">
                    <div
                        className={`flex items-center gap-1`}
                        onClick={() => handleVote(VoteAction.UPVOTE)}
                        style={{ cursor: isLogin ? 'pointer' : 'not-allowed' }}
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
                        style={{ cursor: isLogin ? 'pointer' : 'not-allowed' }}
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
                    <div
                        className="flex items-center gap-1"
                        onClick={onComment}
                    >
                        <img
                            className="w-5 h-5"
                            src={Comment}
                            alt="comment"
                            style={{
                                cursor: isLogin ? 'pointer' : 'not-allowed',
                            }}
                        />
                        <span className="text-xs font-medium tracking-wide text-black/80">
                            {commentCount}
                        </span>
                    </div>
                </footer>
            </div>
            {compact && imageUrl && (
                <div className="max-w-[150px] rounded-xl shadow-base hidden">
                    <img
                        className="object-cover w-full h-full"
                        src={imageUrl}
                        alt="image"
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
