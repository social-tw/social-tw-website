import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import React, { useEffect, useState } from 'react'
import LinesEllipsis from 'react-lines-ellipsis'
import { Link } from 'react-router-dom'
import Avatar from '@/components/common/Avatar'
import { PostStatus, VoteAction, VoteMsg } from '@/types'
import Comment from '../../assets/comment.png'
import Downvote from '../../assets/downvote.png'
import Upvote from '../../assets/upvote.png'
import { useUser } from '../../contexts/User'
import useVotes, { useVoteEvents } from '../../hooks/useVotes'
import LikeAnimation from '../ui/animations/LikeAnimation'
import useStore from '../../store/usePostStore'

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

    const { isLogin, userState } = useUser()
    const { create } = useVotes()
    const [upvotes, setUpvotes] = useState(upCount)
    const [downvotes, setDownvotes] = useState(downCount)
    // TODO: Need get vote state from backend or calucate from ecpochKey
    // 'upvote', 'downvote', or null
    const [voteState, setVoteState] = useState<
        VoteAction.UPVOTE | VoteAction.DOWNVOTE | null
    >(null)
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
        let newUpCount = upCount
        let newDownCount = downCount
        if (ignoreNextEvent) return
        setIgnoreNextEvent(true)

        // if exist vote, cancel vote
        if (isMineState && finalAction !== null && finalAction !== voteType) {
            const cancelAction =
                finalAction === VoteAction.UPVOTE
                    ? VoteAction.CANCEL_UPVOTE
                    : VoteAction.CANCEL_DOWNVOTE
            setIgnoreNextEvent(true)

            console.log('cancel vote', finalAction, cancelAction)
            success = await create(id, cancelAction)

            if (success) {
                if (cancelAction === VoteAction.CANCEL_UPVOTE) {
                    // newUpCount -= 1
                    setLocalUpCount((prev) => prev - 1)
                } else {
                    // newDownCount -= 1
                    setLocalDownCount((prev) => prev - 1)
                }
                // wait for 500ms to set isMineState to false
                setTimeout(() => setIgnoreNextEvent(false), 500)
            }
        }

        // if not exist vote, create vote
        if (!isMineState || finalAction !== voteType) {
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
                    // newUpCount += 1
                    setLocalUpCount((prev) => prev + 1)
                    // setVoteState(VoteAction.UPVOTE)
                } else {
                    // newDownCount += 1
                    setLocalDownCount((prev) => prev + 1)
                    // setVoteState(VoteAction.DOWNVOTE)
                }
                setIsAction(action)
                // set isMineState to true
                setIsMineState(true)
                updateVoteCount(id, newUpCount, newDownCount)
            }
            setTimeout(() => setIgnoreNextEvent(false), 500)
        }

        setTimeout(() => setShow(false), 500)
    }

    useVoteEvents((msg: VoteMsg) => {
        if (id !== msg.postId || ignoreNextEvent) return

        switch (msg.vote) {
            case VoteAction.UPVOTE:
                setLocalUpCount((prev) => prev + 1)
                break
            case VoteAction.DOWNVOTE:
                setLocalDownCount((prev) => prev + 1)
                break
            case VoteAction.CANCEL_UPVOTE:
                setLocalUpCount((prev) => prev - 1)
                break
            case VoteAction.CANCEL_DOWNVOTE:
                setLocalDownCount((prev) => prev - 1)
                break
        }
    })

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
        </article>
    )
}
