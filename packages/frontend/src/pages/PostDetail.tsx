import { useEffect, useState } from 'react'
import { CommentStatus, PostInfo } from '../types'
import { useParams } from 'react-router-dom'
import Post from '../components/post/Post'
import Comment from '../components/comment/Comment'
import CommentForm, {
    CommentValues,
} from '../components/comment/MobileCommentForm'
import TransactionModal from '../components/modal/ui/comment/TransactionModal'
import ErrorModal from '../components/modal/ErrorModal'
import { useUser } from '../contexts/User'
import { SERVER } from '../config'
import LOGIN_ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'
import DesktopCommentForm from '../components/comment/DesktopCommentForm'
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

const demoComments = [
    {
        id: '1',
        epochKey: 'epochKey-2',
        publishedAt: new Date(),
        content: '台灣der小巷就是讚啦！',
        status: CommentStatus.Success,
        isMine: true,
    },
    {
        id: '2',
        epochKey: 'epochKey-3',
        publishedAt: new Date(),
        content: '這裡的芋圓推推推！',
        status: CommentStatus.Success,
        isMine: false,
    },
    {
        id: '3',
        epochKey: 'epochKey-4',
        publishedAt: new Date(),
        content: '請問這是哪裡啊？',
        status: CommentStatus.Pending,
        isMine: true,
    },
]

export default function PostDetail() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const { id } = useParams()
    const [post, setPost] = useState<PostInfo>()
    const { isLogin, setErrorCode } = useUser()

    const onSubmit = async (values: CommentValues) => {
        try {
            console.log(values.content)
            setIsModalOpen(true)
            // TODO: await transactions
            setTimeout(() => {
                setIsModalOpen(false)
            }, 3000)
        } catch (err) {
            console.error(err)
        }
    }

    const handleClick = () => {
        setIsOpen((prev) => !prev)
        if (!isLogin) {
            setErrorCode(LOGIN_ERROR_MESSAGES.ACTION_WITHOUT_LOGIN.code)
            return
        }
    }

    useEffect(() => {
        async function loadPost() {
            const response = await fetch(`${SERVER}/api/post/${id}`)
            const post = await response.json()

            setPost({
                id: post._id,
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
                        handleCommentClick={handleClick}
                    />
                </section>
                <section>
                    <ul className="divide-y divide-neutral-600">
                        {demoComments.map((comment, i) => (
                            <li key={i}>
                                <Comment {...comment} />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            {isSmallDevice ? (
                <CommentForm
                    isOpen={isOpen && isLogin}
                    onSubmit={onSubmit}
                    onCancel={() => setIsOpen(false)}
                />
            ) : (
                <DesktopCommentForm
                    isOpen={isOpen && isLogin}
                    onSubmit={onSubmit}
                    onCancel={() => setIsOpen(false)}
                />
            )}
            <ErrorModal
                isOpen={isOpen && !isLogin}
                buttonText="返回註冊/登入頁"
            />
            <TransactionModal isOpen={isModalOpen} />
        </>
    )
}
