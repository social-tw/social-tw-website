import { QueryKeys } from '@/constants/queryKeys'
import { PostService } from '@/features/core'
import { CommentList, CommentNotification, PostItem } from '@/features/post'
import { PostStatus, RelayRawPostStatus } from '@/types/Post'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

const PostDetailsPage: React.FC = () => {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    if (!id) {
        navigate('/')
    }

    const { data } = useQuery({
        queryKey: [QueryKeys.SinglePost, id],
        queryFn: async () => {
            if (!id) return undefined
            const postService = new PostService()
            return postService.fetchPostById(id)
        },
    })

    const post = useMemo(() => {
        if (!data) return undefined

        return {
            id: data._id,
            postId: data.postId,
            epoch: data.epoch,
            epochKey: data.epochKey,
            content: data.content,
            publishedAt: new Date(Number(data.publishedAt)),
            status:
                data.status === RelayRawPostStatus.DISAGREED
                    ? PostStatus.Blocked
                    : data.status === RelayRawPostStatus.REPORTED
                    ? PostStatus.Reported
                    : PostStatus.Success,
            votes: data.votes,
        }
    }, [data])

    if (!id || !post) return null

    return (
        <>
            <div className="px-4 py-6 space-y-6 lg:px-0">
                <section>
                    <PostItem
                        postId={post.postId}
                        epoch={post.epoch}
                        epochKey={post.epochKey}
                        content={post.content}
                        publishedAt={post.publishedAt}
                        status={post.status}
                        isInitiallyOpenComment={
                            searchParams.get('leaveComment') === '1'
                        }
                    />
                </section>
                <section id="comments" className="px-6">
                    <CommentList postId={id} />
                    <div className="h-[50vh]"></div>
                </section>
            </div>
            <CommentNotification postId={id} />
        </>
    )
}

export default PostDetailsPage
