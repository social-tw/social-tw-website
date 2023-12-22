import { useEffect, useState } from 'react'
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
import { PostInfo } from '@/types'
import { useMediaQuery } from '@uidotdev/usehooks'

const demoPost = {
    id: '1',
    epochKey: 'epochKey-1',
    publishedAt: new Date(),
    content:
        '今天真是一個美好的日子！我終於完成了我夢寐以求的目標：跑完全馬拉松！這個挑戰對我來說真的非常艱巨，但我堅持下來了。在這個過程中，我學到了很多關於毅力和奮鬥的價值。我要特別感謝我的家人和朋友對我一直以來的支持和鼓勵。無論你們在生活中面對什麼困難，只要你們相信自己，付出努力，你們一定可以實現自己的目標！今天，我真心覺得自己是最幸運的人。',
    commentCount: 0,
    upCount: 0,
    downCount: 0,
}

export default function PostDetail() {
    const { id } = useParams()
    const { isLogin, setErrorCode } = useUser()

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

            setPost({
                id: post.postId,
                epochKey: post.epochKey,
                content: post.content,
                publishedAt: post.publishedAt,
                commentCount: post.commentCount,
                upCount: post.upCount,
                downCount: post.downCount,
            })
        }
        if (id?.includes('demo')) {
            setPost(demoPost)
        } else {
            loadPost()
        }
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
                        id={post.id}
                        epochKey={post.epochKey}
                        content={post.content}
                        publishedAt={post.publishedAt}
                        commentCount={post.commentCount}
                        upCount={post.upCount}
                        downCount={post.downCount}
                        onComment={onWriteComment}
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
            <CommentNotifications postId={post.id} />
            <AuthErrorDialog isOpen={isError} buttonText="返回註冊/登入頁" />
            <CommentPublishTransition isOpen={isPublishing} />
        </>
    )
}
