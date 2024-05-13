import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CommentNotifications from '@/components/comment/CommentNotification'
import AuthErrorDialog from '@/components/login/AuthErrorDialog'
import Post from '@/components/post/Post'
import checkVoteIsMine from '@/utils/checkVoteIsMine'
import { useQuery } from '@tanstack/react-query'
import CommentForm from './CommentForm'
import CommentList from './CommentList'
import { PostStatus } from '@/types/Post'
import { fetchSinglePost } from '@/utils/api'
import useUserState from '@/hooks/useUserState'
import useIsLogin from '@/hooks/useIsLogin'
import { QueryKeys } from '@/constants/queryKeys'

const PostDetails: React.FC = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    if (!id) {
        navigate('/')
    }

    const { userState } = useUserState()

    const { isLoggedIn } = useIsLogin()

    const { data } = useQuery({
        queryKey: [QueryKeys.SinglePost, id],
        queryFn: async () => {
            if (!id) return undefined
            const post = await fetchSinglePost(id)
            return {
                id: post._id,
                postId: post.postId,
                epochKey: post.epochKey,
                content: post.content,
                publishedAt: new Date(Number(post.publishedAt)),
                commentCount: post.commentCount,
                upCount: post.upCount,
                downCount: post.downCount,
                isMine: false,
                finalAction: null,
                status: PostStatus.Success,
                votes: post.votes,
            }
        },
    })

    const post = useMemo(() => {
        if (data && userState) {
            const voteCheck = checkVoteIsMine(data.votes, userState)
            const isMine = voteCheck.isMine
            const finalAction = voteCheck.finalAction
            return {
                ...data,
                isMine: isMine,
                finalAction: finalAction,
            }
        }
        return data
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
                        isMine={post.isMine}
                        finalAction={post.finalAction}
                    />
                </section>
                <section id="comments">
                    <CommentList postId={id} />
                    <div className="h-[50vh]"></div>
                </section>
            </div>
            <CommentForm
                postId={id}
                isOpen={isOpenComment}
                onClose={() => setIsOpenCommnet(false)}
            />
            <CommentNotifications postId={id} />
            <AuthErrorDialog
                isOpen={!!errorMessage}
                message={errorMessage}
                buttonText="返回註冊/登入頁"
            />
        </>
    )
}

export default PostDetails
