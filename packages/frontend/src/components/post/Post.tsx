import Avatar from 'boring-avatars'
import dayjs from 'dayjs'
import LinesEllipsis from 'react-lines-ellipsis'
import { Link } from 'react-router-dom'
import Comment from '../../assets/comment.png'
import Downvote from '../../assets/downvote.png'
import Upvote from '../../assets/upvote.png'
import { useEffect, useState } from 'react'
import { VoteAction, VoteMsg } from '../../types/VoteAction'
import useVotes, { useVoteEvents } from '../../hooks/useVotes'
import { useUser } from '../../contexts/User'
import LikeAnimation from '../ui/animations/LikeAnimation'

export default function ({
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
}: {
    id: string
    epochKey: string
    content: string
    imageUrl?: string
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
    compact?: boolean
    isMine?: boolean
    finalAction?: VoteAction | null
}) {
    const publishedTime = dayjs(publishedAt)
    const publishedLabel = publishedTime.isBefore(dayjs(), 'day')
        ? publishedTime.format('YYYY/MM/DD')
        : publishedTime.fromNow()

    const { isLogin } = useUser()
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
    // set isAction when finalAction is changed
    useEffect(() => {
        setIsAction(finalAction)
    }, [finalAction])
    const postInfo = (
        <div className="space-y-3">
            <header className="flex items-center gap-4">
                <div className="border-2 border-white rounded-full">
                    <Avatar
                        size={20}
                        name={epochKey}
                        variant="beam"
                        colors={[
                            '#92A1C6',
                            '#146A7C',
                            '#F0AB3D',
                            '#C271B4',
                            '#C20D90',
                        ]}
                    />
                </div>
                <div className="text-xs font-medium tracking-wide text-black/80">
                    {publishedLabel}
                </div>
            </header>
            <section className="text-sm font-medium tracking-wider text-black/90">
                {compact ? (
                    <LinesEllipsis
                        text={content}
                        maxLine="4"
                        ellipsis="..."
                        component="p"
                    />
                ) : (
                    <p>{content}</p>
                )}
            </section>
        </div>
    )

    const handleVote = async (voteType: VoteAction) => {
        let action: VoteAction
        let success = false

        if (isMine && finalAction === voteType) {
            action =
                voteType === VoteAction.UPVOTE
                    ? VoteAction.CANCEL_UPVOTE
                    : VoteAction.CANCEL_DOWNVOTE
            success = await create(id, action)

            if (success) {
                if (action === VoteAction.CANCEL_UPVOTE) {
                    setUpvotes((prev) => prev - 1)
                    setIsAction(null)
                } else {
                    setDownvotes((prev) => prev - 1)
                    setIsAction(null)
                }
            }
        } else {
            if (isMine && finalAction !== null) {
                const cancelAction =
                    finalAction === VoteAction.UPVOTE
                        ? VoteAction.CANCEL_UPVOTE
                        : VoteAction.CANCEL_DOWNVOTE
                await create(id, cancelAction)
                if (cancelAction === VoteAction.CANCEL_UPVOTE) {
                    setUpvotes((prev) => prev - 1)
                } else {
                    setDownvotes((prev) => prev - 1)
                }
            }

            // 进行新的投票
            action = voteType
            success = await create(id, action)
            setShow(true)
            setImgType(
                voteType === VoteAction.UPVOTE
                    ? VoteAction.UPVOTE
                    : VoteAction.DOWNVOTE,
            )

            if (success) {
                if (action === VoteAction.UPVOTE) {
                    setUpvotes((prev) => prev + 1)
                } else {
                    setDownvotes((prev) => prev + 1)
                }
                setIsAction(action)
            }
        }

        setVoteState(
            action === VoteAction.UPVOTE
                ? VoteAction.UPVOTE
                : VoteAction.DOWNVOTE,
        )
        setShow(false)
    }

    useVoteEvents((msg: VoteMsg) => {
        if (id !== msg.postId) return

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
        <article className="flex bg-white/90 rounded-xl shadow-base">
            {<LikeAnimation isLiked={show} imgType={imgType} />}
            <div className="flex-1 p-4 space-y-3">
                {compact ? (
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
                                isMine && isAction === VoteAction.UPVOTE
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
                                isMine && isAction === VoteAction.DOWNVOTE
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
                    <div className="flex items-center gap-1">
                        <img className="w-5 h-5" src={Comment} alt="comment" />
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
        </article>
    )
}
