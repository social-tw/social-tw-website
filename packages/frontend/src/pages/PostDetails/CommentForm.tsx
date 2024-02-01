import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CommentPublishTransition from '@/components/comment/CommentPublishTransition'
import DesktopCommentForm from '@/components/comment/DesktopCommentForm'
import MobileCommentForm, {
    CommentValues,
} from '@/components/comment/MobileCommentForm'
import useCreateComment from '@/hooks/useCreateComment'
import { useQueryClient } from '@tanstack/react-query'
import { useMediaQuery } from '@uidotdev/usehooks'

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
    const queryClient = useQueryClient()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const { create: createCommnet } = useCreateComment()

    const onSubmit = async (values: CommentValues) => {
        if (!postId) return

        const { content } = values

        try {
            setIsSubmitting(true)
            onClose()

            await createCommnet(postId, content)

            await queryClient.invalidateQueries({
                queryKey: ['comments', postId],
            })

            await queryClient.invalidateQueries({
                queryKey: ['post', postId],
            })

            toast('留言成功送出')
        } catch (error) {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (!isSubmitting) return

        const timer = setTimeout(() => {
            setIsSubmitting(false)
        }, 5000)

        return () => {
            clearTimeout(timer)
        }
    }, [isSubmitting])

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
