import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Comment from '@/components/comment/Comment'
import CommentNotifications from '@/components/comment/CommentNotification'
import CommentPublishTransition from '@/components/comment/CommentPublishTransition'
import DesktopCommentForm from '@/components/comment/DesktopCommentForm'
import MobileCommentForm, {
    CommentValues,
} from '@/components/comment/MobileCommentForm'
import AuthErrorDialog from '@/components/login/AuthErrorDialog'
import Post from '@/components/post/Post'
import { SERVER } from '@/config'
import LOGIN_ERROR_MESSAGES from '@/constants/error-messages/loginErrorMessage'
import { useUser } from '@/contexts/User'
import useCreateComment from '@/hooks/useCreateComment'
import useFetchComment from '@/hooks/useFetchComment'
import { useMediaQuery } from '@uidotdev/usehooks'
import { PostInfo, PostStatus } from '../types'
import checkVoteIsMine from '../utils/checkVoteIsMine'

export default function PostDetail() {
    const { id } = useParams()
    const { isLogin, setErrorCode, userState } = useUser()
    const { data: comments } = useFetchComment(id)
    const { create: createCommnet, genProof: genCommentProof } =
        useCreateComment()

    const [post, setPost] = useState<PostInfo>()
    const [isOpenComment, setIsOpenCommnet] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [isError, setIsError] = useState(false)

    const onCloseAnimation = () => {
        setIsPublishing(false)
    }

    const onOpenAnimation = () => {
        setIsPublishing(true)
    }

    const onWriteComment = () => {
        if (!isLogin) {
            setIsError(true)
            setErrorCode(LOGIN_ERROR_MESSAGES.ACTION_WITHOUT_LOGIN.code)
            return
        }
        setIsOpenCommnet((prev) => !prev)
    }

    const onSubmitComment = async (values: CommentValues) => {
        if (!id) return

        const { content } = values

        setIsOpenCommnet(false)
        onOpenAnimation()

        const { proof, epoch } = await genCommentProof(id, content)
        onCloseAnimation()
        await createCommnet(proof, id, content, epoch)
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

    const location = useLocation()

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '')
            const element = document.getElementById(id)
            element?.scrollIntoView()
        }
    }, [location.hash])

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    if (!post) return null

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
                <section>
                    <ul>
                        {comments.map((comment, i) => (
                            <li key={i}>
                                <Comment
                                    isLast={i === comments.length - 1}
                                    {...comment}
                                    onCloseAnimation={onCloseAnimation}
                                    onOpenAnimation={onOpenAnimation}
                                />
                            </li>
                        ))}
                    </ul>
                    <div className="h-[50vh]"></div>
                </section>
            </div>
            {isSmallDevice ? (
                <MobileCommentForm
                    isOpen={isOpenComment}
                    onSubmit={onSubmitComment}
                    onCancel={() => setIsOpenCommnet(false)}
                />
            ) : (
                <DesktopCommentForm
                    isOpen={isOpenComment}
                    onSubmit={onSubmitComment}
                    onCancel={() => setIsOpenCommnet(false)}
                />
            )}
            <CommentNotifications postId={post.id!} />
            <AuthErrorDialog isOpen={isError} buttonText="返回註冊/登入頁" />
            <CommentPublishTransition isOpen={isPublishing} />
        </>
    )
}
