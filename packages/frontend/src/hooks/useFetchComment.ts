import { useEffect, useMemo, useState } from 'react'
import { SERVER } from '@/config'
import {
    commentActionsSelector,
    CommentData,
    useActionStore,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import { CommentInfo, CommentStatus, CommnetDataFromApi } from '@/types'
import checkCommentIsMine from '@/utils/checkCommentIsMine'
import { useQuery } from '@tanstack/react-query'

async function fetchCommentsByPostId(
    postId: string,
): Promise<CommnetDataFromApi[]> {
    const queryParams = new URLSearchParams()

    if (postId) {
        queryParams.append('postId', postId)
    }

    const response = await fetch(
        `${SERVER}/api/comment?${queryParams.toString()}`,
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${await response.json()}`)
    }

    return await response.json()
}

export default function useFetchComment(postId?: string) {
    const { userState } = useUser()
    const commentActions = useActionStore(commentActionsSelector)
    const {
        data: fetchedComments,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['comments', postId],
        queryFn: () =>
            postId
                ? fetchCommentsByPostId(postId)
                : Promise.reject(new Error('postId is undefined')),
        enabled: !!postId,
    })

    const allComments = useMemo(() => {
        const localComments: CommentInfo[] = commentActions.map((action) => ({
            ...(action.data as CommentData),
            publishedAt: action.submittedAt.valueOf(),
            status: action.status as unknown as CommentStatus,
            isMine: true,
        }))

        const apiComments: CommentInfo[] =
            fetchedComments?.map((comment) => {
                const isMine = userState
                    ? checkCommentIsMine(comment, userState)
                    : false
                return {
                    postId: postId ?? 'defaultId',
                    commentId: comment.commentId,
                    epoch: comment.epoch,
                    epochKey: comment.epochKey,
                    content: comment.content,
                    publishedAt: comment.publishedAt,
                    transactionHash: comment.transactionHash,
                    status: CommentStatus.Success,
                    isMine: isMine,
                }
            }) || []

        return [...apiComments, ...localComments]
    }, [commentActions, fetchedComments, userState])

    return {
        data: allComments,
        isLoading,
        error,
    }
}
