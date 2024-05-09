import PostFailureDialog from '@/components/post/PostFailureDialog'
import PostForm, { PostValues } from '@/components/post/PostForm'
import PostPublishTransition from '@/components/post/PostPublishTransition'
import useCreatePost from '@/hooks/useCreatePost'
import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useUser } from '@/contexts/User'
import { UserState } from '@unirep/core'
import { useProfileHistoryStore } from '../Profile/History/store/useProfileHistoryStore'

interface HomePostFormProps {
    disabled?: boolean
}

export default function HomePostForm({ 
    disabled = false 
}: HomePostFormProps) {
    const { userState } = useUser()
    const invokeFetchHistoryPostsFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryPostsFlow,
    )

    const queryClient = useQueryClient()

    const { create: createPost } = useCreatePost()

    const [isSubmitted, setIsSubmitted] = useState(false)

    const [isError, setIsError] = useState(false)

    const onSubmit = async (values: PostValues) => {
        const { content } = values

        const previousPostsData = queryClient.getQueryData(['posts'])

        try {
            setIsSubmitted(true)

            await createPost(content)

            queryClient.invalidateQueries({
                queryKey: ['posts'],
                refetchType: 'all',
            })

            await invokeFetchHistoryPostsFlow(userState as unknown as UserState)

            toast('貼文成功送出')
        } catch (error) {
            setIsSubmitted(false)
            setIsError(true)

            queryClient.setQueryData(['posts'], previousPostsData)
        }
    }

    useEffect(() => {
        if (!isSubmitted) return

        const timer = setTimeout(() => {
            setIsSubmitted(false)
        }, 5000)

        return () => {
            clearTimeout(timer)
        }
    }, [isSubmitted])

    return (
        <>
            <PostForm disabled={disabled} onSubmit={onSubmit} />
            <PostPublishTransition isOpen={isSubmitted} />
            <PostFailureDialog
                isOpen={isError}
                onClose={() => setIsError(false)}
            />
        </>
    )
}


