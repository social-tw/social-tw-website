import { PATHS } from '@/constants/paths'
import { AuthErrorDialog, useAuthStatus } from '@/features/auth'
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

    const navigate = useNavigate()

    const queryClient = useQueryClient()

    const { isPending, error, reset, createPost } = useCreatePost()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (values: PostFormValues) => {
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

    if (!isLoggedIn) {
        return (
            <AuthErrorDialog
                isOpen={true}
                message="很抱歉通知您，您尚未登陸帳號，請返回註冊頁再次嘗試註冊，謝謝您！"
            />
        )
    }

    return (
        <div className="p-4">
            <PostForm onCancel={() => navigate('/')} onSubmit={onSubmit} />
            <PostPublishTransition isOpen={isSubmitting} />
            <PostFailureDialog isOpen={!!error} onClose={() => reset()} />
        </div>
    )
}
