import { SERVER } from '@/constants/config'
import { FetchPostsResponse } from '@/types/api'
import { PostInfo, PostStatus, RelayRawPostStatus } from '@/types/Post'
import {
    DefaultError,
    InfiniteData,
    QueryKey,
    useInfiniteQuery,
} from '@tanstack/react-query'
import { useIntersectionObserver, useMediaQuery } from '@uidotdev/usehooks'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Fragment, useEffect, useRef } from 'react'
import PostItem from '../PostItem/PostItem'

function WelcomePost({
    postId,
    epoch,
    epochKey,
    content,
    publishedAt = new Date(),
    status,
}: {
    postId: string
    epoch: number
    epochKey: string
    content: string
    publishedAt: Date
    status: PostStatus
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
            <PostItem
                postId={postId}
                epoch={epoch}
                epochKey={epochKey}
                content={content}
                publishedAt={publishedAt}
                status={status}
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
            return jsonData
                .filter((item) => item.status === RelayRawPostStatus.ON_CHAIN)
                .map((item) => {
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
                                    postId={post.postId!}
                                    epoch={post.epoch!}
                                    epochKey={post.epochKey!}
                                    content={post.content!}
                                    publishedAt={post.publishedAt}
                                    status={post.status}
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
