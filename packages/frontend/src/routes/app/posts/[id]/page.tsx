import { QueryKeys } from '@/constants/queryKeys'
import { PostService, useUserState } from '@/features/core'
import {
    CommentList,
    CommentNotification,
    CreateComment,
    Post,
    useVotes,
} from '@/features/post'
import { useReputationScore } from '@/features/reporting'
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import { PostStatus, RelayRawPostStatus } from '@/types/Post'
import { VoteAction } from '@/types/Vote'
import checkVoteIsMine from '@/utils/helpers/checkVoteIsMine'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

const PostDetailsPage: React.FC = () => {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    if (!id) {
        navigate('/')
    }

    const { userState } = useUserState()

    const { createVote } = useVotes()

    const { data, refetch } = useQuery({
        queryKey: [QueryKeys.SinglePost, id],
        queryFn: async () => {
            if (!id) return undefined
            const postService = new PostService()
            return postService.fetchPostById(id)
        },
    })

    const post = useMemo(() => {
        if (!data) return undefined

        let voteCheck
        if (userState) {
            voteCheck = checkVoteIsMine(data?.votes, userState)
        }

        return {
            id: data._id,
            postId: data.postId,
            epoch: data.epoch,
            epochKey: data.epochKey,
            content: data.content,
            publishedAt: new Date(Number(data.publishedAt)),
            commentCount: data.commentCount,
            upCount: data.upCount,
            downCount: data.downCount,
            isReported: data.status === RelayRawPostStatus.REPORTED,
            isBlocked: data.status === RelayRawPostStatus.DISAGREED,
            isMine: voteCheck ? voteCheck.isMine : false,
            finalAction: voteCheck ? voteCheck.finalAction : null,
            votedNonce: voteCheck ? voteCheck.votedNonce : null,
            votedEpoch: voteCheck ? voteCheck.votedEpoch : null,
            status: PostStatus.Success,
            votes: data.votes,
        }
    }, [data, userState])

    const [isOpenComment, setIsOpenComment] = useState(false)

    const { isValidReputationScore } = useReputationScore()

    const onWriteComment = () => {
        if (!isValidReputationScore) {
            openForbidActionDialog()
            return
        }
        setIsOpenComment((prev) => !prev)
    }

    const handleVote = async (voteType: VoteAction): Promise<boolean> => {
        if (!post) return false
        try {
            if (post.isMine && post.finalAction !== null) {
                const cancelAction =
                    post.finalAction === VoteAction.UPVOTE
                        ? VoteAction.CANCEL_UPVOTE
                        : VoteAction.CANCEL_DOWNVOTE

                await createVote({
                    id: post.postId,
                    voteAction: cancelAction,
                    votedNonce: post.votedNonce,
                    votedEpoch: post.votedEpoch,
                })
            }
            if (voteType !== post.finalAction) {
                await createVote({
                    id: post.postId,
                    voteAction: voteType,
                    votedNonce: null,
                    votedEpoch: null,
                })
            }

            await refetch()

            return true
        } catch (err) {
            return false
        }
    }

    useEffect(() => {
        const leaveComment = searchParams.get('leaveComment')

        if (leaveComment === '1') {
            setIsOpenComment(true)
        }
    }, [searchParams])

    if (!id || !post) return null

    return (
        <>
            <div className="px-4 py-6 space-y-6 lg:px-0">
                <section>
                    <Post
                        id={post.postId}
                        epoch={post.epoch}
                        epochKey={post.epochKey}
                        content={post.content}
                        publishedAt={post.publishedAt}
                        commentCount={post.commentCount}
                        upCount={post.upCount}
                        downCount={post.downCount}
                        onComment={onWriteComment}
                        isReported={post.isReported}
                        isBlocked={post.isBlocked}
                        isMine={post.isMine}
                        finalAction={post.finalAction}
                        votedNonce={post.votedNonce}
                        votedEpoch={post.votedEpoch}
                        onVote={handleVote}
                    />
                </section>
                <section id="comments" className="px-6">
                    <CommentList postId={id} />
                    <div className="h-[50vh]"></div>
                </section>
            </div>
            <CreateComment
                postId={id}
                isOpen={isOpenComment}
                onClose={() => setIsOpenComment(false)}
            />
            <CommentNotification postId={id} />
        </>
    )
}

export default PostDetailsPage
