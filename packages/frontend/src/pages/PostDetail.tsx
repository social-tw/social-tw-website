import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMediaQuery } from '@uidotdev/usehooks'
import Post from '../components/post/Post'
import { SERVER } from '../config'

import type { PostInfo } from '../types'
import CommentForm from '../components/comment/CommentForm'
import TransactionModal from '../components/modal/ui/comment/TransactionModal'
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
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { id } = useParams()
    const [post, setPost] = useState<PostInfo>()

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
            <div className={clsx(isSmallDevice && 'divide-y divide-neutral-600 px-4')}>
                <section className="py-6">
                    <Post
                        id={post.id}
                        epochKey={post.epochKey}
                        content={post.content}
                        publishedAt={post.publishedAt}
                        commentCount={post.commentCount}
                        upCount={post.upCount}
                        downCount={post.downCount}
                        handleCommentClick={() => setIsOpen(prev => !prev)}
                    />
                </section>
            </div>
            <CommentForm
                isOpen={isOpen}
            />
            <TransactionModal />
        </>

    )
}
