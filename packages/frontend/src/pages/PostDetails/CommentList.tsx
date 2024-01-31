import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Comment from "@/components/comment/Comment";
import { SERVER } from "@/config";
import {
    ActionStatus, commentActionsSelector, CommentData, removeActionById,
    useActionStore
} from "@/contexts/Actions";
import { useUser } from "@/contexts/User";
import useCreateComment from "@/hooks/useCreateComment";
import { CommentStatus } from "@/types";
import { RelayRawComment } from "@/types/api";
import checkCommentIsMine from "@/utils/checkCommentIsMine";
import { useQuery } from "@tanstack/react-query";

interface CommentListProps {
    postId: string
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
    const { userState } = useUser()

    const { data: comments, refetch } = useQuery({
        queryKey: ['comments', postId],
        queryFn: async () => {
            const comments = await fetchCommentsByPostId(postId)
            return comments
                .sort((a, b) => Number(a.publishedAt) - Number(b.publishedAt))
                .map((comment) => {
                    const isMine = userState
                        ? checkCommentIsMine(comment, userState)
                        : false

                    return {
                        postId: postId,
                        commentId: comment.commentId!,
                        epoch: comment.epoch,
                        epochKey: comment.epochKey ?? '',
                        content: comment.content ?? '',
                        publishedAt: new Date(Number(comment.publishedAt)),
                        transactionHash: comment.transactionHash,
                        status: CommentStatus.Success,
                        isMine: isMine,
                    }
                })
        },
    })

    const commentActions = useActionStore(commentActionsSelector)

    const localComments = useMemo(() => {
        return commentActions
            .filter((action) => action.status !== ActionStatus.Success)
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
                    isMine: true,
                }
            })
    }, [commentActions])

    const location = useLocation()

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '')
            const element = document.getElementById(id)
            element?.scrollIntoView()
        }
    }, [location.hash])

    const { create: createCommnet } = useCreateComment()

    return (
        <ul className="divide-y divide-neutral-600">
            {comments?.map((comment) => (
                <li key={comment.transactionHash}>
                    <Comment
                        commentId={comment.commentId}
                        epoch={comment.epoch}
                        epochKey={comment.epochKey}
                        content={comment.content}
                        transactionHash={comment.transactionHash}
                        publishedAt={comment.publishedAt}
                        status={comment.status}
                        isMine={comment.isMine}
                    />
                </li>
            ))}
            {localComments.map((comment) => (
                <li key={`local-comment-${comment.actionId}`}>
                    <Comment
                        commentId={comment.commentId}
                        epoch={comment.epoch}
                        epochKey={comment.epochKey}
                        content={comment.content}
                        transactionHash={comment.transactionHash}
                        publishedAt={comment.publishedAt}
                        status={comment.status}
                        isMine={comment.isMine}
                        onRepublish={async () => {
                            removeActionById(comment.actionId)
                            await createCommnet(comment.postId, comment.content)
                            await refetch()
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
