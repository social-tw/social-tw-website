import { AUTH_ERROR_MESSAGE } from '@/constants/errorMessage'
import { PATHS } from '@/constants/paths'
import { useAuthStatus } from '@/features/auth'
import { useAuthStore } from '@/features/auth/stores/authStore'
import {
    PostFailureDialog,
    PostForm,
    PostPublishTransition,
    useCreatePost,
    type PostFormValues,
} from '@/features/post'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function WritePostPage() {
    const { isLoggedIn } = useAuthStatus()
    const setErrorMessage = useAuthStore((state) => state.setErrorMessage)

    const navigate = useNavigate()

    const queryClient = useQueryClient()

    const { isPending, error, reset, createPost } = useCreatePost()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (values: PostFormValues) => {
        if (!isLoggedIn) return
        const previousPostsData = queryClient.getQueryData(['posts'])

        try {
            await createPost(values)
        } catch {
            queryClient.setQueryData(['post'], previousPostsData)
        }
    }

    useEffect(() => {
        if (isPending) {
            setIsSubmitting(true)

            const timer = setTimeout(() => {
                setIsSubmitting(false)
                navigate(PATHS.HOME)
            }, 5000)

            return () => {
                clearTimeout(timer)
            }
        }
    }, [isPending, navigate])

    useEffect(() => {
        if (!isLoggedIn) {
            setErrorMessage(AUTH_ERROR_MESSAGE.DEFAULT)
        }
    }, [isLoggedIn, setErrorMessage])

    return (
        <div className="p-4">
            <PostForm onCancel={() => navigate('/')} onSubmit={onSubmit} />
            <PostPublishTransition
                isOpen={isSubmitting}
                onClose={() => setIsSubmitting(false)}
            />
            <PostFailureDialog isOpen={!!error} onClose={() => reset()} />
        </div>
    )
}
