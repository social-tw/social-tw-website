import { useUserState } from '@/features/core'
import {
    type PostFormValues,
    PostFailureDialog,
    PostForm,
    PostPublishTransition,
    useCreatePost,
} from '@/features/post'
import { useProfileHistoryStore } from '@/features/profile'
import { useQueryClient } from '@tanstack/react-query'
import { UserState } from '@unirep/core'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function CreatePost({
    disabled = false,
}: {
    disabled?: boolean
}) {
    const { userState } = useUserState()

    const invokeFetchHistoryPostsFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryPostsFlow,
    )

    const queryClient = useQueryClient()

    const { isPending, error, reset, createPost } = useCreatePost()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (values: PostFormValues) => {
        const previousPostsData = queryClient.getQueryData(['posts'])

        try {
            await createPost(values)
            await invokeFetchHistoryPostsFlow(userState as unknown as UserState)
            toast('貼文成功送出')
        } catch {
            setIsSubmitting(false)
            queryClient.setQueryData(['posts'], previousPostsData)
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

    return (
        <>
            <PostForm disabled={disabled} onSubmit={onSubmit} />
            <PostPublishTransition isOpen={isSubmitting} />
            <PostFailureDialog isOpen={!!error} onClose={() => reset()} />
        </>
    )
}
