import clsx from 'clsx'
import { useMediaQuery } from '@uidotdev/usehooks'
import Post from '../components/Post'

const post = {
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
    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    return (
        <div className={clsx(isSmallDevice && 'divide-y divide-neutral-600')}>
            <section className="py-6">
                <Post
                    id={post.id}
                    epochKey={post.epochKey}
                    content={post.content}
                    publishedAt={post.publishedAt}
                    commentCount={post.commentCount}
                    upCount={post.upCount}
                    downCount={post.downCount}
                />
            </section>
        </div>
    )
}
