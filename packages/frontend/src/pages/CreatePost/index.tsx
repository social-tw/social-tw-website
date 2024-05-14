import AuthErrorDialog from '@/components/login/AuthErrorDialog'
import PostFailureDialog from '@/components/post/PostFailureDialog'
import PostForm, { PostValues } from '@/components/post/PostForm'
import PostPublishTransition from '@/components/post/PostPublishTransition'
import useCreatePost from '@/hooks/useCreatePost'
import { useQueryClient } from '@tanstack/react-query'
import { UserState } from '@unirep/core'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileHistoryStore } from '../Profile/History/store/useProfileHistoryStore'
import useIsLogin from '@/hooks/useIsLogin'
import { useUserState } from '@/hooks/useUserState'
import { PATHS } from '@/constants/paths'

export default function CreatePost() {
    const { userState } = useUserState()

    const { isLoggedIn } = useIsLogin()

    const invokeFetchHistoryPostsFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryPostsFlow,
    )

    const navigate = useNavigate()

    const queryClient = useQueryClient()

    const { isPending, error, reset, createPost } = useCreatePost()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (values: PostValues) => {
        const previousPostsData = queryClient.getQueryData(['posts'])

        try {
            await createPost(values)
            await invokeFetchHistoryPostsFlow(userState as unknown as UserState)
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
        } else {
            setIsSubmitting(false)
        }
    }, [isPending])

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
