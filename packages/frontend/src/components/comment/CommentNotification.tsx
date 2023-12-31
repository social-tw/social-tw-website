import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import CloseIcon from '@/assets/close.svg'
import PostIcon from '@/assets/post.svg'
import useCommentEvents from '@/hooks/useCommentEvents'
import { CommentMsg } from '@/types'

interface CommentNotificationsProps {
    postId: string
}

const CommentNotifications: React.FC<CommentNotificationsProps> = (props) => {
    const { postId } = props

    const { list, removeAt } = useCommentEvents(postId)

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
                    {list.map((item, i) => renderNotification(item, i))}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default CommentNotifications
