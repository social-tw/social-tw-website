import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CommentPublishTransition from '@/components/comment/CommentPublishTransition'
import DesktopCommentForm from '@/components/comment/DesktopCommentForm'
import MobileCommentForm, {
    CommentValues,
} from '@/components/comment/MobileCommentForm'
import { useUserState } from '@/hooks/useUserState/useUserState'
import { useCreateComment } from '@/hooks/useCreateComment/useCreateComment'
import { useMediaQuery } from '@uidotdev/usehooks'
import { useProfileHistoryStore } from '@/pages/Profile/History/store/useProfileHistoryStore'
import { UserState } from '@unirep/core'

interface CommentFormProps {
    postId: string
    isOpen?: boolean
    onClose?: () => void
}

const CommentForm: React.FC<CommentFormProps> = ({
    postId,
    isOpen = false,
    onClose = () => {},
}) => {
    const { userState } = useUserState()

    const invokeFetchHistoryCommentsFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryCommentsFlow,
    )

    const [isSubmitting, setIsSubmitting] = useState(false)

    const { isPending, createComment } = useCreateComment()

    const onSubmit = async (values: CommentValues) => {
        try {
            if (!postId || !userState) return
            onClose()

            const { content } = values

            await createComment({
                postId,
                content,
            })

            await invokeFetchHistoryCommentsFlow(
                userState as unknown as UserState,
            )

            toast('留言成功送出')
        } catch {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (isPending) {
            setIsSubmitting(true)

            const timer = setTimeout(() => {
                setIsSubmitting(false)
            }, 5000)

            return () => {
                clearTimeout(timer)
            }
        } else {
            setIsSubmitting(false)
        }
    }, [isPending])

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <>
            {isSmallDevice ? (
                <MobileCommentForm
                    isOpen={isOpen}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
            ) : (
                <DesktopCommentForm
                    isOpen={isOpen}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
            )}
            <CommentPublishTransition isOpen={isSubmitting} />
        </>
    )
}

export default CommentForm
