import { CreatePost, PostList } from '@/features/post'

export default function PostPage() {
    return (
        <div>
            <section className="relative hidden py-6 border-b border-neutral-600 lg:block">
                <CreatePost />
            </section>
            <section className="py-6">
                <PostList />
            </section>
        </div>
    )
}
