import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Comment from '@/components/comment/Comment'
import {
    ActionStatus,
    commentActionsSelector,
    CommentData,
    removeActionById,
    useActionStore,
} from '@/contexts/Actions'
import { useUserState } from '@/hooks/useUserState/useUserState'
import { useEpoch } from '@/hooks/useEpoch/useEpoch'
import { useCreateComment } from '@/hooks/useCreateComment/useCreateComment'
import { useRemoveComment } from '@/hooks/useRemoveComment/useRemoveComment'
import checkCommentIsMine from '@/utils/checkCommentIsMine'
import getNonceFromEpochKey from '@/utils/getNonceFromEpochKey'
import { CommentStatus } from '@/types/Comments'
import { fetchCommentsByPostId } from '@/utils/api'
import { QueryKeys } from '@/constants/queryKeys'

interface CommentListProps {
    postId: string
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
    const { userState, getGuaranteedUserState } = useUserState()

    const { currentEpoch } = useEpoch()

    const { data } = useQuery({
        queryKey: [QueryKeys.ManyComments, postId],
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

            const canDelete = isMine && item.epoch === currentEpoch
            const canReport = !isMine

            return { ...item, canDelete, canReport }
        })
    }, [data, userState, currentEpoch])

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

    const { createComment } = useCreateComment()

    const { removeComment } = useRemoveComment()

    const onDelete = async (
        postId: string,
        commentId: string,
        epoch: number,
        epochKey: string,
    ) => {
        const _userState = getGuaranteedUserState()
        const nonce = getNonceFromEpochKey(epoch, epochKey, _userState)
        if (!nonce) return

        await removeComment({ postId, commentId, epoch, nonce })
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
                            await createComment({
                                postId: comment.postId,
                                content: comment.content,
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

export default CommentList
