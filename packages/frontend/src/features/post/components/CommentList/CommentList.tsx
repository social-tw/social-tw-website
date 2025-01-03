import { QueryKeys } from '@/constants/queryKeys'
import {
    ActionStatus,
    CommentData,
    CommentService,
    commentActionsSelector,
    removeActionById,
    useActionStore,
    useEpoch,
    useUserState,
} from '@/features/core'
import { Comment, useCreateComment, useRemoveComment } from '@/features/post'
import { CommentStatus, RelayRawCommentStatus } from '@/types/Comments'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import getNonceFromEpochKey from '@/utils/helpers/getNonceFromEpochKey'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

export default function CommentList({ postId }: { postId: string }) {
    const [searchParams, setSearchParams] = useSearchParams()

    const { userState, getGuaranteedUserState } = useUserState()

    const { currentEpoch } = useEpoch()

    const { data } = useQuery({
        queryKey: [QueryKeys.ManyComments, postId],
        queryFn: async () => {
            const commentService = new CommentService()
            return commentService.fetchCommentsByPostId(postId)
        },
    })

    const comments = useMemo(() => {
        return (data ?? [])
            .sort((a, b) => Number(a.publishedAt) - Number(b.publishedAt))
            .map((item) => {
                const isMine = userState
                    ? isMyEpochKey(userState, item.epoch, item.epochKey)
                    : false

                const canDelete = isMine && item.epoch === currentEpoch
                const canReport = true

                const focusedComment = searchParams.get('fc')

                return {
                    postId: postId,
                    commentId: item.commentId!,
                    epoch: item.epoch,
                    epochKey: item.epochKey ?? '',
                    content: item.content ?? '',
                    publishedAt: new Date(Number(item.publishedAt)),
                    transactionHash: item.transactionHash,
                    status: CommentStatus.Success,
                    isFocused: focusedComment === item.commentId,
                    isReported: item.status === RelayRawCommentStatus.REPORTED,
                    isBlocked: item.status === RelayRawCommentStatus.DISAGREED,
                    canDelete,
                    canReport,
                }
            })
    }, [data, userState, currentEpoch, searchParams, postId])

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
        const _userState = await getGuaranteedUserState()
        const nonce = getNonceFromEpochKey(epoch, epochKey, _userState)
        if (nonce === undefined || nonce === null) return

        await removeComment({ postId, commentId, epoch, nonce }).catch(
            () => null,
        )
    }

    const onFocusEnd = () => {
        setSearchParams({})
    }

    return (
        <ul className="divide-y divide-neutral-600">
            {comments.map((comment) => (
                <li key={comment.transactionHash}>
                    <Comment
                        postId={comment.postId}
                        commentId={comment.commentId}
                        epochKey={comment.epochKey}
                        content={comment.content}
                        publishedAt={comment.publishedAt}
                        status={comment.status}
                        isFocused={comment.isFocused}
                        isReported={comment.isReported}
                        isBlocked={comment.isBlocked}
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
                        onFocusEnd={onFocusEnd}
                    />
                </li>
            ))}
            {localComments.map((comment) => (
                <li key={`local-comment-${comment.actionId}`}>
                    <Comment
                        postId={comment.postId}
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
