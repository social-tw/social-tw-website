import AuthErrorDialog from '@/components/login/AuthErrorDialog'
import PostFailureDialog from '@/components/post/PostFailureDialog'
import PostForm, { PostValues } from '@/components/post/PostForm'
import PostPublishTransition from '@/components/post/PostPublishTransition'
import { useUser } from '@/contexts/User'
import useCreatePost from '@/hooks/useCreatePost'
import { useQueryClient } from '@tanstack/react-query'
import { UserState } from '@unirep/core'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileHistoryStore } from '../Profile/History/store/useProfileHistoryStore'

export default function CreatePost() {
    const { isLogin, userState } = useUser()
    const invokeFetchHistoryPostsFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryPostsFlow,
    )

    const navigate = useNavigate()

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
        } catch (error) {
            setIsSubmitted(false)
            setIsError(true)
            queryClient.setQueryData(['post'], previousPostsData)
        }
    }

    useEffect(() => {
        if (!isSubmitted) return

        const timer = setTimeout(() => {
            setIsSubmitted(false)
            navigate('/')
        }, 5000)

        return () => {
            clearTimeout(timer)
        }
    }, [isSubmitted])

    if (!isLogin) {
        return <AuthErrorDialog isOpen={true} />
    }

    return (
        <div className="p-4">
            <PostForm onCancel={() => navigate('/')} onSubmit={onSubmit} />
            <PostPublishTransition isOpen={isSubmitted} />
            <PostFailureDialog
                isOpen={isError}
                onClose={() => setIsError(false)}
            />
        </div>
    )
}
