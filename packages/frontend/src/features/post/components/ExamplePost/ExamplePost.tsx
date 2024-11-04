import CommentImg from "@/assets/img/comment.png"
import DownVoteImg from "@/assets/img/downvote.png"
import UpVoteImg from "@/assets/img/upvote.png"
import { ReactComponent as EllipsisIcon } from '@/assets/svg/ellipsis.svg'
import { useTourStore } from "@/features/core"
import { Avatar } from "@/features/shared"
import dayjs from "dayjs"
import { nanoid } from "nanoid"

const examplePost = {
    epochKey: nanoid(),
    publishedAt: new Date(),
    content: "這是一篇貼文：Ｄ 歡迎你來到 Unirep Social Taiwan 🙌🏻 ！這是一個透過區塊鏈技術所打造的全匿名的社群平台，你可以在這個擁有社群自主機制的空間裡自由發表言論，享受真正的言論自由！",
    upCount: 520,
    downCount: 66,
    commentCount: 1314,
}

export default function ExamplePost() {
    const { run } = useTourStore()

    if (!run) {
        return null
    }
    
    const dateLabel =  dayjs(examplePost.publishedAt).fromNow()
    
    return (
        <article className="p-4 space-y-3 bg-white/90 rounded-xl shadow-base" data-tour-step="4">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar name={examplePost.epochKey} />
                    <span className="text-xs font-medium tracking-wide text-black/80">
                        {dateLabel}
                    </span>
                </div>
                <button className="flex items-center justify-center w-6 h-6" data-tour-step="5">
                    <EllipsisIcon className="cursor-pointer" />
                </button>
            </header>
            <section>
                <p className="text-sm font-medium tracking-wider break-words text-black/90 whitespace-break-spaces">
                    {examplePost.content}
                </p>
            </section>
            <footer className="flex items-center gap-4">
                <ActionButton
                    iconImage={UpVoteImg}
                    iconAlt={`upvote`}
                    label={`${examplePost.upCount}`}
                />
                <ActionButton
                    iconImage={DownVoteImg}
                    iconAlt={`downvote`}
                    label={`${examplePost.downCount}`}
                />
                <ActionButton
                    iconImage={CommentImg}
                    iconAlt={`comment`}
                    label={`${examplePost.commentCount}`}
                />
                
            </footer>
        </article>
    )
}

function ActionButton({
    iconImage,
    iconAlt,
    label,
    onClick,
}: {
    iconImage: string
    iconAlt: string
    label: string
    onClick?: () => void
}) {
    return (
        <button
            className="flex items-center gap-1 cursor-pointer"
            onClick={onClick}
        >
            <img
                className="w-5 h-5"
                src={iconImage}
                alt={iconAlt}
            />
            <span className="text-xs font-medium tracking-wide text-black/80">
                {label}
            </span>
        </button>
    )
}
