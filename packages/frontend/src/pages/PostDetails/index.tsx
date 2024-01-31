import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CommentNotifications from '@/components/comment/CommentNotification'
import AuthErrorDialog from '@/components/login/AuthErrorDialog'
import Post from '@/components/post/Post'
import { SERVER } from '@/config'
import LOGIN_ERROR_MESSAGES from '@/constants/error-messages/loginErrorMessage'
import { useUser } from '@/contexts/User'
import { PostInfo, PostStatus } from '@/types'
import checkVoteIsMine from '@/utils/checkVoteIsMine'
import CommentForm from './CommentForm'
import CommentList from './CommentList'

const PostDetails: React.FC = () => {
    const { id } = useParams()

    const { userState, isLogin, setErrorCode } = useUser()

    const [post, setPost] = useState<PostInfo>()
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

    useEffect(() => {
        async function loadPost() {
            const response = await fetch(`${SERVER}/api/post/${id}`)
            const post = await response.json()

            let isMine = false
            let finalAction = null
            if (userState) {
                const voteCheck = checkVoteIsMine(post.votes, userState)
                isMine = voteCheck.isMine
                finalAction = voteCheck.finalAction
            }
            setPost({
                id: post._id,
                postId: post.postId,
                epochKey: post.epochKey,
                content: post.content,
                publishedAt: new Date(Number(post.publishedAt)),
                commentCount: post.commentCount,
                upCount: post.upCount,
                downCount: post.downCount,
                isMine: isMine,
                finalAction: finalAction,
                status: PostStatus.Success,
            })
        }
        loadPost()
    }, [id])

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
