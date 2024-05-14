import PostFailureDialog from '@/components/post/PostFailureDialog'
import PostForm, { PostValues } from '@/components/post/PostForm'
import PostPublishTransition from '@/components/post/PostPublishTransition'
import useCreatePost from '@/hooks/useCreatePost'
import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { UserState } from '@unirep/core'
import { useProfileHistoryStore } from '../Profile/History/store/useProfileHistoryStore'
import { useUserState } from '@/hooks/useUserState'

interface HomePostFormProps {
    disabled?: boolean
}

export default function HomePostForm({ disabled = false }: HomePostFormProps) {
    const { userState } = useUserState()

    const invokeFetchHistoryPostsFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryPostsFlow,
    )

    const queryClient = useQueryClient()

    const { isPending, error, reset, createPost } = useCreatePost()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (values: PostValues) => {
        const previousPostsData = queryClient.getQueryData(['posts'])

        try {
            await createPost(values)
            await invokeFetchHistoryPostsFlow(userState as unknown as UserState)
            toast('貼文成功送出')
        } catch {
            queryClient.setQueryData(['posts'], previousPostsData)
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

    return (
        <>
            <PostForm disabled={disabled} onSubmit={onSubmit} />
            <PostPublishTransition isOpen={isSubmitting} />
            <PostFailureDialog isOpen={!!error} onClose={() => reset()} />
        </>
    )
}
