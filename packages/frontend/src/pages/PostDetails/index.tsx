import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CommentNotifications from '@/components/comment/CommentNotification'
import AuthErrorDialog from '@/components/login/AuthErrorDialog'
import Post from '@/components/post/Post'
import { SERVER } from '@/config'
import LOGIN_ERROR_MESSAGES from '@/constants/error-messages/errorMessage'
import { useUser } from '@/contexts/User'
import { PostStatus } from '@/types'
import checkVoteIsMine from '@/utils/checkVoteIsMine'
import { useQuery } from '@tanstack/react-query'
import CommentForm from './CommentForm'
import CommentList from './CommentList'

async function fetchPostById(postId: string) {
    const response = await fetch(`${SERVER}/api/post/${postId}`)
    return await response.json()
}

const PostDetails: React.FC = () => {
    const { id } = useParams()

    const navigate = useNavigate()

    if (!id) {
        navigate('/')
    }

    const { userState, isLogin, setErrorCode } = useUser()

    const { data } = useQuery({
        queryKey: ['post', id],
        queryFn: async () => {
            if (!id) return undefined
            const post = await fetchPostById(id)
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
    const [isError, setIsError] = useState(false)

    const onWriteComment = () => {
        if (!isLogin) {
            setIsError(true)
            setErrorCode(LOGIN_ERROR_MESSAGES.ACTION_WITHOUT_LOGIN.code)
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
            <AuthErrorDialog isOpen={isError} buttonText="返回註冊/登入頁" />
        </>
    )
}

export default PostDetails
