import Avatar from 'boring-avatars'
import dayjs from 'dayjs'
import LinesEllipsis from 'react-lines-ellipsis'
import { Link } from 'react-router-dom'
import Comment from '../../assets/comment.png'
import Downvote from '../../assets/downvote.png'
import Upvote from '../../assets/upvote.png'
import { useState } from 'react'
import { VoteAction, VoteMsg } from '../../types/VoteAction'
import useVotes, { useVoteEvents } from '../../hooks/useVotes'
import { useUser } from '../../contexts/User'
import LikeAnimation from '../ui/animations/LikeAnimation'; // 假設LikeAnimation和Post.tsx在同一個目錄


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
}) {
    const publishedTime = dayjs(publishedAt)
    const publishedLabel = publishedTime.isBefore(dayjs(), 'day')
        ? publishedTime.format('YYYY/MM/DD')
        : publishedTime.fromNow()
    const [isLiked, setIsLiked] = useState(true);
    const handleLike = () => {
        setIsLiked(!isLiked); // 切換點讚狀態
    };

    const { isLogin } = useUser()
    const { create } = useVotes()

    const [upvotes, setUpvotes] = useState(upCount)
    const [downvotes, setDownvotes] = useState(downCount)
    // TODO: Need get vote state from backend or calucate from ecpochKey
    // 'upvote', 'downvote', or null
    const [voteState, setVoteState] = useState<'upvote' | 'downvote' | null>(
        null
    )
    const [localUpCount, setLocalUpCount] = useState(upCount)
    const [localDownCount, setLocalDownCount] = useState(downCount)

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

    const handleUpvote = async () => {
        let action
        let success = false

        if (voteState === 'upvote') {
            action = VoteAction.CANCEL_UPVOTE
            success = await create(id, action)

            if (success) {
                setUpvotes((prev) => prev - 1)
                setVoteState(null)
            }
        } else {
            if (voteState === 'downvote') {
                action = VoteAction.CANCEL_DOWNVOTE
                success = await create(id, action)

                if (success) {
                    setDownvotes((prev) => prev - 1)
                }
            }

            action = VoteAction.UPVOTE
            success = await create(id, action)

            if (success) {
                setUpvotes((prev) => prev + 1)
                setVoteState('upvote')
            }
        }
    }

    const handleDownvote = async () => {
        let action
        let success = false

        if (voteState === 'downvote') {
            action = VoteAction.CANCEL_DOWNVOTE
            success = await create(id, action)

            if (success) {
                setDownvotes((prev) => prev - 1)
                setVoteState(null)
            }
        } else {
            if (voteState === 'upvote') {
                action = VoteAction.CANCEL_UPVOTE
                success = await create(id, action)

                if (success) {
                    setUpvotes((prev) => prev - 1)
                }
            }

            action = VoteAction.DOWNVOTE
            success = await create(id, action)

            if (success) {
                setDownvotes((prev) => prev + 1)
                setVoteState('downvote')
            }
        }
    }

    useVoteEvents((msg: VoteMsg) => {
        // 確保只響應當前帖子的投票事件
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
                        className="flex items-center gap-1"
                        onClick={handleUpvote}
                        style={{ cursor: isLogin ? 'pointer' : 'not-allowed' }}
                    >
                        <img className="w-5 h-5" src={Upvote} alt="upvote" />
                        <span className="text-xs font-medium tracking-wide text-black/80">
                            {localUpCount}
                        </span>
                    </div>
                    <div
                        className="flex items-center gap-1"
                        onClick={handleDownvote}
                        style={{ cursor: isLogin ? 'pointer' : 'not-allowed' }}
                    >
                        <img
                            className="w-5 h-5"
                            src={Downvote}
                            alt="downvote"
                        />
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
            <LikeAnimation isLiked={isLiked} />
        </article>
    )
}
