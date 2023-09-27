import Avatar from 'boring-avatars'
import dayjs from 'dayjs'
import LinesEllipsis from 'react-lines-ellipsis'
import { Link } from 'react-router-dom'
import Comment from '../assets/comment.png'
import Downvote from '../assets/downvote.png'
import Upvote from '../assets/upvote.png'

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
                    <div className="flex items-center gap-1">
                        <img className="w-5 h-5" src={Upvote} alt="upvote" />
                        <span className="text-xs font-medium tracking-wide text-black/80">
                            {upCount}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <img
                            className="w-5 h-5"
                            src={Downvote}
                            alt="downvote"
                        />
                        <span className="text-xs font-medium tracking-wide text-black/80">
                            {downCount}
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
