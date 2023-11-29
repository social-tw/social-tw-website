import { action } from 'mobx'
import { useEffect, useMemo, useState } from 'react'
import {
    commentActionsSelector,
    CommentData,
    failedCommentActionsSelector,
    pendingCommentActionsSelector,
    useActionStore,
} from '@/contexts/Actions'
import { CommentInfo, CommentStatus, CommnetDataFromApi } from '@/types'

const demoComments = [
    {
        id: '1',
        epochKey: 'epochKey-2',
        publishedAt: Date.now(),
        content: '台灣der小巷就是讚啦！',
    },
    {
        id: '2',
        epochKey: 'epochKey-3',
        publishedAt: Date.now(),
        content: '這裡的芋圓推推推！',
    },
    {
        id: '3',
        epochKey: 'epochKey-4',
        publishedAt: Date.now(),
        content: '請問這是哪裡啊？',
    },
]

async function fetchCommentsByPostId(postId: string) {
    // mock api call
    return new Promise<CommnetDataFromApi[]>((resolve) => {
        setTimeout(() => {
            resolve(demoComments)
        }, 500)
    })
}

export default function useFetchComment(postId?: string) {
    const [comments, setComments] = useState<CommentInfo[]>([])

    const commentActions = useActionStore(commentActionsSelector)
    const failedActions = useActionStore(failedCommentActionsSelector)
    const pendingActions = useActionStore(pendingCommentActionsSelector)

    const allComments = useMemo(() => {
        const localComments: CommentInfo[] = commentActions.map((action) => ({
            ...(action.data as CommentData),
            publishedAt: action.submittedAt,
            status: action.status as unknown as CommentStatus,
            // TODO: check this comment is mine
            isMine: true,
        }))
        return [...comments, ...localComments]
    }, [comments, failedActions, pendingActions])

    useEffect(() => {
        async function loadCommnets() {
            if (!postId) return

            const comments = await fetchCommentsByPostId(postId)
            const successfulComments = comments.map((comment) => ({
                ...comment,
                postId,
                status: CommentStatus.Success,
                // TODO: check this comment is mine
                isMine: false,
            }))

            setComments(successfulComments)
        }

        loadCommnets()
    }, [])

    return {
        data: allComments,
    }
}
