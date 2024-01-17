import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PostFailureDialog from "@/components/post/PostFailureDialog";
import PostForm, { PostValues } from "@/components/post/PostForm";
import PostPublishTransition from "@/components/post/PostPublishTransition";
import useCreatePost from "@/hooks/useCreatePost";
import { PostInfo, PostStatus } from "@/types";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";

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

        const pendingPost = {
            id: `pending-${nanoid()}`,
            postId: undefined,
            epochKey: undefined,
            content,
            publishedAt: new Date(),
            commentCount: 0,
            upCount: 0,
            downCount: 0,
            status: PostStatus.Pending
        }
        try {
            setIsSubmitted(true)
            queryClient.setQueryData(
                ['posts'],
                (old: InfiniteData<PostInfo[]>) => ({
                    pages: [
                        [pendingPost, ...old.pages[0]],
                        ...old.pages.slice(1),
                    ],
                    pageParams: old.pageParams,
                }),
            )

            const { transactionHash, postId, epochKey } = await create(content)
            const newPost = {
                ...pendingPost,
                id: transactionHash,
                postId,
                epochKey,
                status: PostStatus.Success,
            }

            queryClient.setQueryData(
                ['posts'],
                (old: InfiniteData<PostInfo[]>) => {
                    const firstPage = old.pages[0].filter(
                        (post) => post.id !== pendingPost.id,
                    )
                    return {
                        pages: [[newPost, ...firstPage], ...old.pages.slice(1)],
                        pageParams: old.pageParams,
                    }
                },
            )

            toast('貼文成功送出')
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
