import { useEffect, useMemo, useState } from 'react'
import {
    commentActionsSelector,
    CommentData,
    useActionStore,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import { CommentInfo, CommentStatus, CommnetDataFromApi } from '@/types'
import checkCommentIsMine from '@/utils/checkCommentIsMine'

async function fetchCommentsByPostId(
    postId: string,
): Promise<CommnetDataFromApi[]> {
    const queryParams = new URLSearchParams()

    if (postId) {
        queryParams.append('postId', postId)
    }

    const response = await fetch(
        `http://localhost:8000/api/comment?${queryParams.toString()}`,
    )

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
}

export default function useFetchComment(postId?: string) {
    const [comments, setComments] = useState<CommentInfo[]>([])
    const { userState } = useUser()

    const commentActions = useActionStore(commentActionsSelector)

    const allComments = useMemo(() => {
        const localComments: CommentInfo[] = commentActions.map((action) => ({
            ...(action.data as CommentData),
            publishedAt: action.submittedAt.valueOf(),
            status: action.status as unknown as CommentStatus,
            isMine: true,
        }))
        return [...comments, ...localComments]
    }, [comments])

    useEffect(() => {
        const loadComments = async () => {
            if (!postId) return

            const comments = await fetchCommentsByPostId(postId)

            const successfulComments = comments.map((comment) => {
                const isMine = userState
                    ? checkCommentIsMine(comment, userState)
                    : false

                return {
                    postId: postId,
                    commentId: comment.commentId,
                    epoch: comment.epoch,
                    epochKey: comment.epochKey,
                    content: comment.content,
                    publishedAt: comment.publishedAt,
                    transactionHash: comment.transactionHash,
                    status: CommentStatus.Success,
                    isMine: isMine,
                }
            })

            setComments([...successfulComments])
        }

        loadComments()
    }, [userState])

    return {
        data: allComments,
    }
}
