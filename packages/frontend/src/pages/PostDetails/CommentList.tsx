import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import Comment from '@/components/comment/Comment'
import { SERVER } from '@/config'
import {
    ActionStatus,
    commentActionsSelector,
    CommentData,
    removeActionById,
    useActionStore,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import useCreateComment from '@/hooks/useCreateComment'
import useRemoveComment from '@/hooks/useRemoveComment'
import { CommentStatus } from '@/types'
import { RelayRawComment } from '@/types/api'
import checkCommentIsMine from '@/utils/checkCommentIsMine'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useEpoch from '@/hooks/useEpoch'
import getNonceFromEpochKey from '@/utils/getNonceFromEpochKey'

interface CommentListProps {
    postId: string
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
    const { userState } = useUser()

    const { epoch } = useEpoch()

    const queryClient = useQueryClient()

    const { data, refetch } = useQuery({
        queryKey: ['comments', postId],
        queryFn: async () => {
            const comments = await fetchCommentsByPostId(postId)
            return comments
                .sort((a, b) => Number(a.publishedAt) - Number(b.publishedAt))
                .map((comment) => ({
                    postId: postId,
                    commentId: comment.commentId!,
                    epoch: comment.epoch,
                    epochKey: comment.epochKey ?? '',
                    content: comment.content ?? '',
                    publishedAt: new Date(Number(comment.publishedAt)),
                    transactionHash: comment.transactionHash,
                    status: CommentStatus.Success,
                }))
        },
    })

    const comments = useMemo(() => {
        return (data ?? []).map((item) => {
            const isMine = userState
                ? checkCommentIsMine(item, userState)
                : false

            const canDelete = isMine && item.epoch === epoch
            const canReport = !isMine

            return { ...item, canDelete, canReport }
        })
    }, [data, userState, epoch])

    const commentActions = useActionStore(commentActionsSelector)

    const localComments = useMemo(() => {
        return commentActions
            .filter((action) => action.status !== ActionStatus.Success)
            .filter((action) => (action.data as CommentData).postId === postId)
            .map((action) => {
                const data = action.data as CommentData
                return {
                    actionId: action.id,
                    postId: data.postId,
                    commentId: data.commentId,
                    epoch: data.epoch,
                    epochKey: data.epochKey,
                    content: data.content,
                    transactionHash: data.transactionHash,
                    publishedAt: action.submittedAt,
                    status: action.status as unknown as CommentStatus,
                    canDelete: action.status === ActionStatus.Failure,
                    canReport: false,
                }
            })
    }, [commentActions, postId])

    const location = useLocation()

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '')
            const element = document.getElementById(id)
            element?.scrollIntoView()
        }
    }, [location.hash])

    const { create: createCommnet } = useCreateComment()

    const { remove: removeComment } = useRemoveComment()

    const onDelete = async (
        postId: string,
        commentId: string,
        epoch: number,
        epochKey: string,
    ) => {
        const nonce = getNonceFromEpochKey(epoch, epochKey, userState!)
        if (!nonce) return

        await removeComment(postId, commentId, epoch, nonce)
        await refetch()
        await queryClient.invalidateQueries({
            queryKey: ['post', postId],
        })
    }

    return (
        <ul className="divide-y divide-neutral-600">
            {comments.map((comment) => (
                <li key={comment.transactionHash}>
                    <Comment
                        commentId={comment.commentId}
                        epochKey={comment.epochKey}
                        content={comment.content}
                        publishedAt={comment.publishedAt}
                        status={comment.status}
                        canDelete={comment.canDelete}
                        canReport={comment.canReport}
                        onDelete={async () => {
                            await onDelete(
                                comment.postId,
                                comment.commentId,
                                comment.epoch,
                                comment.epochKey,
                            )
                        }}
                    />
                </li>
            ))}
            {localComments.map((comment) => (
                <li key={`local-comment-${comment.actionId}`}>
                    <Comment
                        commentId={comment.commentId}
                        epochKey={comment.epochKey}
                        content={comment.content}
                        publishedAt={comment.publishedAt}
                        status={comment.status}
                        canDelete={comment.canDelete}
                        canReport={comment.canReport}
                        onRepublish={async () => {
                            removeActionById(comment.actionId)
                            await createCommnet(comment.postId, comment.content)
                            await refetch()
                            await queryClient.invalidateQueries({
                                queryKey: ['post', postId],
                            })
                        }}
                        onDelete={() => {
                            removeActionById(comment.actionId)
                        }}
                    />
                </li>
            ))}
        </ul>
    )
}

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

export default CommentList
