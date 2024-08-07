import {
    CommentFormDesktop,
    CommentFormMobile,
    CommentPublishTransition,
    useCreateComment,
    type CommentFormValues,
} from '@/features/post'
import { useMediaQuery } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function CreateComment({
    postId,
    isOpen = false,
    onClose = () => {},
}: {
    postId: string
    isOpen?: boolean
    onClose?: () => void
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { isPending, createComment, reset } = useCreateComment()

    const onSubmit = async (values: CommentFormValues) => {
        try {
            if (!postId) return
            onClose()

            const { content } = values

            await createComment({
                postId,
                content,
            })

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
                reset()
            }, 5000)

            return () => {
                clearTimeout(timer)
            }
        }
    }, [isPending, reset])

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <>
            {isSmallDevice ? (
                <CommentFormMobile
                    isOpen={isOpen}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
            ) : (
                <CommentFormDesktop
                    isOpen={isOpen}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                />
            )}
            <CommentPublishTransition isOpen={isSubmitting} />
        </>
    )
}
