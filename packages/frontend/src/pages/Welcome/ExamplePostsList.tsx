import Post from '../../components/post/Post'
import { MOCK_POSTS } from '../../constants/mockPosts'

// TODO: This is no more used in latest verstion
export function ExamplePostsList() {
    return (
        <div className="divide-y divide-neutral-600 max-w-[600px] w-11/12">
            <section className="py-6">
                <ul className="space-y-6">
                    {MOCK_POSTS.map((post) => (
                        <li
                            key={post.id}
                            className="transition-opacity duration-500"
                        >
                            <Post
                                id={post.id}
                                epochKey={post.epochKey}
                                content={post.content}
                                publishedAt={post.publishedAt}
                                commentCount={post.commentCount}
                                upCount={post.upCount}
                                downCount={post.downCount}
                                compact
                            />
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}
