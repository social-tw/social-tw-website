import { nanoid } from 'nanoid'
import { Fragment, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Post from '@/components/post/Post'
import { SERVER } from '@/config'
import {
    ActionStatus,
    postActionsSelector,
    PostData,
    useActionStore,
} from '@/contexts/Actions'
import { useUser } from '@/contexts/User'
import { useVoteEvents } from '@/hooks/useVotes'
import { FetchPostsResponse } from '@/types/api'
import checkVoteIsMine from '@/utils/checkVoteIsMine'
import {
    DefaultError,
    InfiniteData,
    QueryKey,
    useInfiniteQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useIntersectionObserver } from '@uidotdev/usehooks'
import { handleVoteEvent } from '@/utils/handleVoteEvent'
import { PostInfo, PostStatus } from '@/types/Post' //using shared function

export default function PostList() {
    const { userState } = useUser()
    const queryClient = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteQuery<
            PostInfo[],
            DefaultError,
            InfiniteData<PostInfo[]>,
            QueryKey,
            number
        >({
            queryKey: ['posts'],
            queryFn: async ({ pageParam = 1 }) => {
                const res = await fetch(`${SERVER}/api/post?page=` + pageParam)
                const jsonData = (await res.json()) as FetchPostsResponse
                return jsonData.map((item) => {
                    const voteCheck = userState
                        ? checkVoteIsMine(item.votes, userState)
                        : {
                              isMine: false,
                              finalAction: null,
                          }
                    return {
                        id: item.transactionHash!,
                        postId: item.postId,
                        epochKey: item.epochKey,
                        content: item.content,
                        publishedAt: new Date(Number(item.publishedAt)),
                        commentCount: item.commentCount,
                        upCount: item.upCount,
                        downCount: item.downCount,
                        isMine: voteCheck.isMine,
                        finalAction: voteCheck.finalAction,
                        status: PostStatus.Success,
                    }
                })
            },
            initialPageParam: 1,
            getNextPageParam: (lastPage, allPages) => {
                return lastPage.length === 0 ? undefined : allPages.length + 1
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
            fetchNextPage({ cancelRefetch: false })
        }
    }, [entry, hasNextPage, fetchNextPage])

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
                    content: actionData.content,
                    publishedAt: action.submittedAt,
                    commentCount: 0,
                    upCount: 0,
                    downCount: 0,
                    isMine: true,
                    finalAction: null,
                    status: action.status as unknown as PostStatus,
                }
            })
            .filter((post) => !post.postId || !postIds.includes(post.postId))
            .sort((a, b) => a.publishedAt.valueOf() - b.publishedAt.valueOf())
    }, [postActions, data])

    const navigate = useNavigate()

    function gotoCommentsByPostId(postId: string) {
        navigate(`/posts/${postId}/#comments`)
    }

    useVoteEvents((msg) => handleVoteEvent(queryClient, msg)) //using shared function

    return (
        <div ref={pageContainerRef}>
            <ul className="space-y-3 md:space-y-6">
                {localPosts.map((post) => (
                    <li
                        key={post.id}
                        className="transition-opacity duration-500"
                    >
                        <Post
                            id={post.postId}
                            epochKey={post.epochKey}
                            content={post.content}
                            publishedAt={post.publishedAt}
                            commentCount={post.commentCount}
                            upCount={post.upCount}
                            downCount={post.downCount}
                            compact
                            isMine={post.isMine}
                            finalAction={post.finalAction}
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
                                <Post
                                    id={post.postId}
                                    epochKey={post.epochKey}
                                    content={post.content}
                                    publishedAt={post.publishedAt}
                                    commentCount={post.commentCount}
                                    upCount={post.upCount}
                                    downCount={post.downCount}
                                    compact
                                    isMine={post.isMine}
                                    finalAction={post.finalAction}
                                    status={post.status}
                                    onComment={() => {
                                        if (!post.postId) return
                                        gotoCommentsByPostId(post.postId)
                                    }}
                                />
                            </li>
                        ))}
                    </Fragment>
                ))}
            </ul>
            <div ref={pageBottomRef} className="w-full h-1 bg-transparent" />
            {isFetchingNextPage && (
                <div className="loading-indicator">Loading more posts...</div>
            )}
        </div>
    )
}
