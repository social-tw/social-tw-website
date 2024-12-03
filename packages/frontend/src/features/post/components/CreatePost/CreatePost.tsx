import {
    type PostFormValues,
    PostFailureDialog,
    PostForm,
    PostPublishTransition,
    useCreatePost,
} from '@/features/post'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export default function CreatePost({
    disabled = false,
}: {
    disabled?: boolean
}) {
    const queryClient = useQueryClient()

    const { isPending, error, reset, createPost } = useCreatePost()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const onSubmit = async (values: PostFormValues) => {
        const previousPostsData = queryClient.getQueryData(['posts'])

        try {
            await createPost(values)
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
            <PostPublishTransition
                isOpen={isSubmitting}
                onClose={() => setIsSubmitting(false)}
            />
            <PostFailureDialog isOpen={!!error} onClose={() => reset()} />
        </>
    )
}
