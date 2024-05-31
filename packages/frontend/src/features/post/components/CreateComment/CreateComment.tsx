import toast from 'react-hot-toast'
import { UserState } from '@unirep/core'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '@uidotdev/usehooks'
import { useUserState } from '@/features/core'
import {
    CommentPublishTransition,
    CommentFormDesktop,
    CommentFormMobile,
    useCreateComment,
    type CommentFormValues,
} from '@/features/post'
import { useProfileHistoryStore } from '@/features/profile'

export default function CreateComment({
    postId,
    isOpen = false,
    onClose = () => {},
}: {
    postId: string
    isOpen?: boolean
    onClose?: () => void
}) {
    const { userState } = useUserState()

    const invokeFetchHistoryCommentsFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryCommentsFlow,
    )

    const [isSubmitting, setIsSubmitting] = useState(false)

    const { isPending, createComment, reset } = useCreateComment()

    const onSubmit = async (values: CommentFormValues) => {
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
