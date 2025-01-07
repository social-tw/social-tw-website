import { CreatePost, PostList } from '@/features/post'
import clsx from 'clsx'
import { useWindowScroll } from 'react-use'

export default function PostPage() {
    const { y } = useWindowScroll()

    return (
        <div>
            <section
                className={clsx(
                    'sticky top-[137px] z-10 hidden py-6 border-b border-neutral-600 lg:block backdrop-blur-lg',
                    y > 16 && 'bg-[linear-gradient(200deg,#0A0A0A,#282828)]',
                )}
            >
                <CreatePost />
            </section>
            <section className="py-6">
                <PostList />
            </section>
        </div>
    )
}
