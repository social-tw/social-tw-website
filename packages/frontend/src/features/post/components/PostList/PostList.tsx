import { QueryKeys } from '@/constants/queryKeys'

import {
    ActionStatus,
    postActionsSelector,
    PostData,
    PostService,
    useActionStore,
    useUserState,
} from '@/features/core'
import { PostItem, useVoteEvents } from '@/features/post'
import { PostStatus, RelayRawPostStatus } from '@/types/Post'
import { handleVoteEvent } from '@/utils/handleVoteEvent'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useIntersectionObserver } from '@uidotdev/usehooks'
import { nanoid } from 'nanoid'
import { Fragment, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ExamplePost from '../ExamplePost/ExamplePost'

export default function PostList() {
    const { userState } = useUserState()
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') ?? ''

    const queryClient = useQueryClient()

    const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: [QueryKeys.ManyPosts, query],
        queryFn: async ({ pageParam }) => {
            const postService = new PostService()
            const data = await postService.fetchPosts(pageParam, query)

            return data.map((item) => {
                return {
                    id: item.transactionHash!,
                    postId: item.postId,
                    epochKey: item.epochKey,
                    epoch: item.epoch,
                    content: item.content,
                    publishedAt: new Date(Number(item.publishedAt)),
                    status:
                        item.status === RelayRawPostStatus.DISAGREED
                            ? PostStatus.Blocked
                            : item.status === RelayRawPostStatus.REPORTED
                            ? PostStatus.Reported
                            : PostStatus.Success,
                }
            })
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            return lastPage.length === 0 ? undefined : lastPageParam + 1
        },
    })

    const [pageBottomRef, entry] = useIntersectionObserver({
        threshold: 0,
        rootMargin: '10%',
    })

    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage) {
            fetchNextPage({ cancelRefetch: false })
        }
    }, [entry, fetchNextPage, hasNextPage, userState])

    const postActions = useActionStore(postActionsSelector)

    const localPosts = useMemo(() => {
        const postIds = (data?.pages ?? []).flat().map((post) => post.postId)
        return postActions
            .filter((action) => action.status !== ActionStatus.Failure)
            .map((action) => {
                const actionData = action.data as PostData
                return {
                    id: actionData?.transactionHash ?? nanoid(),
                    postId: actionData?.postId,
                    epochKey: actionData?.epochKey,
                    epoch: actionData?.epoch,
                    content: actionData.content,
                    publishedAt: action.submittedAt,
                    status: action.status as unknown as PostStatus,
                }
            })
            .filter((post) => !post.postId || !postIds.includes(post.postId))
            .sort((a, b) => a.publishedAt.valueOf() - b.publishedAt.valueOf())
    }, [postActions, data])

    useVoteEvents((msg) => handleVoteEvent(queryClient, msg))

    return (
        <div className="px-4 lg:px-0">
            <ul className="space-y-3 md:space-y-6">
                <li>
                    <ExamplePost />
                </li>
                {localPosts.map((post) => (
                    <li
                        key={post.id}
                        className="transition-opacity duration-500"
                    >
                        <PostItem
                            compact
                            epoch={post.epoch!}
                            epochKey={post.epochKey!}
                            content={post.content!}
                            publishedAt={post.publishedAt}
                            status={post.status}
                        />
                    </li>
                ))}
                {data?.pages.map((group, i) => (
                    <Fragment key={i}>
                        {group.map((post) => (
                            <li
                                key={post.id}
                                className="transition-opacity duration-500"
                            >
                                <PostItem
                                    compact
                                    link={`/posts/${post.postId}`}
                                    postId={post.postId}
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
