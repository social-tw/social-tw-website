import { Fragment, useEffect, useRef } from 'react'
import Post from '@/features/post/components/Post/Post'
import { SERVER } from '@/constants/config'
import { FetchPostsResponse } from '@/types/api'
import {
    DefaultError,
    InfiniteData,
    QueryKey,
    useInfiniteQuery,
} from '@tanstack/react-query'
import { useIntersectionObserver, useMediaQuery } from '@uidotdev/usehooks'
import { PostInfo, PostStatus } from '@/types/Post'
import { motion, useScroll, useTransform } from 'framer-motion'

function WelcomePost({
    id = '',
    epochKey = '',
    content = '',
    publishedAt = new Date(),
    commentCount = 0,
    upCount = 0,
    downCount = 0,
}: {
    id?: string
    epochKey?: string
    content?: string
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
}) {
    const ref = useRef(null)

    const isMobile = useMediaQuery('only screen and (max-width : 768px)')

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', `start ${isMobile ? '300px' : '320px'}`],
    })

    const opacity = useTransform(
        scrollYProgress,
        [0, 0.9, 0.95, 1],
        [0.3, 1, 1, 0.1],
    )

    return (
        <motion.div ref={ref} style={{ opacity: opacity }}>
            <Post
                id={id}
                epochKey={epochKey}
                content={content}
                publishedAt={publishedAt}
                commentCount={commentCount}
                upCount={upCount}
                downCount={downCount}
                compact
            />
        </motion.div>
    )
}

export default function WelcomePostList() {
    const { data, fetchNextPage, hasNextPage } = useInfiniteQuery<
        PostInfo[],
        DefaultError,
        InfiniteData<PostInfo[]>,
        QueryKey,
        number
    >({
        queryKey: ['posts'],
        queryFn: async ({ pageParam }) => {
            const res = await fetch(`${SERVER}/api/post?page=` + pageParam)
            const jsonData = (await res.json()) as FetchPostsResponse
            return jsonData.map((item) => {
                return {
                    id: item.transactionHash!,
                    postId: item.postId,
                    epochKey: item.epochKey,
                    content: item.content,
                    publishedAt: new Date(Number(item.publishedAt)),
                    commentCount: item.commentCount,
                    upCount: item.upCount,
                    downCount: item.downCount,
                    isMine: false,
                    finalAction: null,
                    votedNonce: null, // Ensure these fields are included
                    votedEpoch: null, // Ensure these fields are included
                    status: PostStatus.Success,
                }
            }) as PostInfo[] // Cast to PostInfo[]
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            return lastPage?.length === 0 ? undefined : lastPageParam + 1
        },
    })

    const pageContainerRef = useRef(null)

    const [pageBottomRef, entry] = useIntersectionObserver({
        threshold: 0,
        root: pageContainerRef.current ?? null,
        rootMargin: '10%',
    })

    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage) {
            fetchNextPage({ cancelRefetch: false }).then((r) => r)
        }
    }, [entry, fetchNextPage, hasNextPage])

    return (
        <div className="h-full" ref={pageContainerRef}>
            <ul className="space-y-3 md:space-y-6">
                {data?.pages.map((group, i) => (
                    <Fragment key={i}>
                        {group.map((post) => (
                            <li key={post.id}>
                                <WelcomePost
                                    id={post.postId}
                                    epochKey={post.epochKey}
                                    content={post.content}
                                    publishedAt={post.publishedAt}
                                    commentCount={post.commentCount}
                                    upCount={post.upCount}
                                    downCount={post.downCount}
                                />
                            </li>
                        ))}
                    </Fragment>
                ))}
            </ul>
            <div ref={pageBottomRef} className="w-full h-1 bg-transparent" />
        </div>
    )
}
