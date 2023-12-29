import { useEffect, useMemo, useState } from 'react'
import {
    commentActionsSelector,
    CommentData,
    failedCommentActionsSelector,
    pendingCommentActionsSelector,
    useActionStore,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import { CommentInfo, CommentStatus, CommnetDataFromApi } from '@/types'
import checkCommentIsMine from '@/utils/checkCommentIsMine'

const demoComments = [
    {
        commentId: '100',
        postId: '0',
        epoch: 100,
        epochKey: 'epochKey-2',
        content: '台灣der小巷就是讚啦！',
        transactionHash: 'test-trans',
        publishedAt: Date.now(),
        status: CommentStatus.Success,
        isMine: false,
    },
    {
        commentId: '101',
        postId: '0',
        epoch: 100,
        epochKey: 'epochKey-2',
        content: '請問這是哪裡？',
        transactionHash: 'test-trans',
        publishedAt: Date.now(),
        status: CommentStatus.Success,
        isMine: false,
    },
    {
        commentId: '102',
        postId: '0',
        epoch: 100,
        epochKey: 'epochKey-2',
        content: '這裡的芋圓推推推！',
        transactionHash: 'test-trans',
        publishedAt: Date.now(),
        status: CommentStatus.Success,
        isMine: false,
    },
]

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
    const failedActions = useActionStore(failedCommentActionsSelector)
    const pendingActions = useActionStore(pendingCommentActionsSelector)

    const allComments = useMemo(() => {
        const localComments: CommentInfo[] = commentActions.map((action) => ({
            ...(action.data as CommentData),
            publishedAt: action.submittedAt,
            status: action.status as unknown as CommentStatus,
            isMine: true,
        }))
        return [...comments, ...localComments]
    }, [comments, failedActions, pendingActions])

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

            setComments([...successfulComments, ...demoComments])
        }

        loadComments()
    }, [userState])

    return {
        data: allComments,
    }
}