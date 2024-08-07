import { QueryKeys } from '@/constants/queryKeys'
import { AuthErrorDialog, useAuthStatus } from '@/features/auth'
import { PostService, useUserState } from '@/features/core'
import {
    CommentList,
    CommentNotification,
    CreateComment,
    Post,
    useVotes,
} from '@/features/post'
import { PostStatus, RelayRawPostStatus } from '@/types/Post'
import { VoteAction } from '@/types/Vote'
import checkVoteIsMine from '@/utils/helpers/checkVoteIsMine'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const PostDetailsPage: React.FC = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    if (!id) {
        navigate('/')
    }

    const { userState } = useUserState()

    const { isLoggedIn } = useAuthStatus()

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
            epochKey: data.epochKey,
            content: data.content,
            publishedAt: new Date(Number(data.publishedAt)),
            commentCount: data.commentCount,
            upCount: data.upCount,
            downCount: data.downCount,
            isReported: data.status === RelayRawPostStatus.REPORTED,
            isMine: voteCheck ? voteCheck.isMine : false,
            finalAction: voteCheck ? voteCheck.finalAction: null,
            votedNonce: voteCheck ? voteCheck.votedNonce : null,
            votedEpoch: voteCheck ? voteCheck.votedEpoch : null,
            status: PostStatus.Success,
            votes: data.votes,
        }
    }, [data, userState])

    const [isOpenComment, setIsOpenCommnet] = useState(false)

    const [errorMessage, setErrorMessage] = useState<string>()

    const onWriteComment = () => {
        if (!isLoggedIn) {
            setErrorMessage(
                '很抱歉通知您，您尚未登陸帳號，請返回註冊頁再次嘗試註冊，謝謝您！',
            )
            return
        }
        setIsOpenCommnet((prev) => !prev)
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

            await refetch() // Refresh the post data after voting

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    if (!id || !post) return null

    return (
        <>
            <div className="px-4">
                <section className="py-6">
                    <Post
                        id={post.postId}
                        epochKey={post.epochKey}
                        content={post.content}
                        publishedAt={post.publishedAt}
                        commentCount={post.commentCount}
                        upCount={post.upCount}
                        downCount={post.downCount}
                        onComment={onWriteComment}
                        isReported={post.isReported}
                        isMine={post.isMine}
                        finalAction={post.finalAction}
                        votedNonce={post.votedNonce}
                        votedEpoch={post.votedEpoch}
                        onVote={handleVote}
                    />
                </section>
                <section id="comments">
                    <CommentList postId={id} />
                    <div className="h-[50vh]"></div>
                </section>
            </div>
            <CreateComment
                postId={id}
                isOpen={isOpenComment}
                onClose={() => setIsOpenCommnet(false)}
            />
            <CommentNotification postId={id} />
            <AuthErrorDialog
                isOpen={!!errorMessage}
                message={errorMessage}
                buttonText="返回註冊/登入頁"
            />
        </>
    )
}

export default PostDetailsPage
