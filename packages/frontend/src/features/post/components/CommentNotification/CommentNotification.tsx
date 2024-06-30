import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import { ReactComponent as PostIcon } from '@/assets/svg/post.svg'
import { useUserState } from '@/features/core'
import { useCommentEvents } from '@/features/post'
import { CommentMsg } from '@/types/Comments'
import { isMyEpochKeyOnEpoch } from '@/utils/helpers/epochKey'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface CommentNotificationsProps {
    postId: string
}

export default function CommentNotifications({
    postId,
}: CommentNotificationsProps) {
    const { userState } = useUserState()

    const { list, removeAt } = useCommentEvents(postId)

    const newComments = list.filter(
        (item) =>
            userState &&
            !isMyEpochKeyOnEpoch(userState, item.epoch, item.epochKey),
    )

    const renderNotification = (item: CommentMsg, index: number) => {
        const link = `/posts/${postId}#${item.id}`

        return (
            <motion.div
                className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg bg-secondary/90 p-3"
                key={item.id}
                animate="visible"
                initial="hidden"
                exit="hidden"
                variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 60 },
                }}
            >
                <div className="flex items-center gap-2">
                    <PostIcon className="w-5 text-white" />
                    <span className="text-xs text-white">
                        這則貼文有新的留言!
                    </span>
                    <Link
                        className="text-xs text-white underline"
                        to={link}
                        onClick={() => removeAt(index)}
                    >
                        前往查看留言
                    </Link>
                </div>
                <button className="text-white" onClick={() => removeAt(index)}>
                    <CloseIcon className="w-4 h-4" />
                </button>
            </motion.div>
        )
    }
    return (
        <div className="fixed w-screen bottom-28">
            <div className="flex flex-col max-w-sm gap-3 px-8 mx-auto">
                <AnimatePresence>
                    {newComments.map((comment, i) =>
                        renderNotification(comment, i),
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
