import LinesEllipsis from "react-lines-ellipsis";
import { Link } from "react-router-dom";
import Comment from "@/assets/comment.png";
import Downvote from "@/assets/downvote.png";
import Upvote from "@/assets/upvote.png";
import Avatar from "@/components/common/Avatar";
import formatDate from "@/utils/formatDate";

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
    onComment = () => { },
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
    onComment?: () => void
}) {
    const postInfo = (
        <div className="space-y-3">
            <header className="flex items-center gap-4">
                <Avatar name={epochKey} />
                <span className="text-xs font-medium tracking-wide text-black/80">
                    {formatDate(publishedAt)}
                </span>
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
                    <div
                        className="flex items-center gap-1"
                        onClick={onComment}
                    >
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
