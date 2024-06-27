import { SignupPendingTransition } from '@/features/auth'
import { PostList, CreatePost } from '@/features/post'

export default function PostPage() {
    return (
        <div>
            <section className="relative hidden py-6 border-b border-neutral-600 lg:block">
                <CreatePost />
                <SignupPendingTransition />
            </section>
            <section className="py-6">
                <PostList />
            </section>
        </div>
    )
}
