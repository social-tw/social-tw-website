import { useEffect, useMemo, useState } from 'react'
import { SERVER } from '@/config'
import {
    commentActionsSelector,
    CommentData,
    useActionStore,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import checkCommentIsMine from '@/utils/checkCommentIsMine'
import { CommentInfo, CommentStatus, RelayRawComment } from '@/types/Comments'

async function fetchCommentsByPostId(
    postId: string,
): Promise<RelayRawComment[]> {
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
