import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PostFailureDialog from "@/components/post/PostFailureDialog";
import PostForm, { PostValues } from "@/components/post/PostForm";
import PostPublishTransition from "@/components/post/PostPublishTransition";
import useCreatePost from "@/hooks/useCreatePost";
import { useQueryClient } from "@tanstack/react-query";

interface HomePostFormProps {
    disabled?: boolean
}

const HomePostForm: React.FC<HomePostFormProps> = ({ disabled = false }) => {
    const navigate = useNavigate()

    const queryClient = useQueryClient()

    const { create } = useCreatePost()

    const [isSubmitted, setIsSubmitted] = useState(false)

    const [isError, setIsError] = useState(false)

    const onSubmit = async (values: PostValues) => {
        const { content } = values

        const previousPostsData = queryClient.getQueryData(['posts'])

        try {
            setIsSubmitted(true)

            await create(content)

            queryClient.invalidateQueries({
                queryKey: ['posts'],
                refetchType: 'all',
            })

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
            <PostForm
                disabled={disabled}
                onCancel={() => navigate('/')}
                onSubmit={onSubmit}
            />
            <PostPublishTransition isOpen={isSubmitted} />
            <PostFailureDialog
                isOpen={isError}
                onClose={() => setIsError(false)}
            />
        </>
    )
}

export default HomePostForm
