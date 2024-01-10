import { Fragment, useEffect } from 'react'
import Post from '@/components/post/Post'
import { SERVER } from '@/config'
import { useUser } from '@/contexts/User'
import { useVoteEvents } from '@/hooks/useVotes'
import { PostInfo, VoteAction, VoteMsg } from '@/types'
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

export default function PostList() {
    const { userState } = useUser()

    const queryClient = useQueryClient()

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
                }
            })
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            return lastPage.length === 0 ? undefined : lastPageParam + 1
        },
    })

    const [pageBottomRef, entry] = useIntersectionObserver({
        threshold: 0,
        root: null,
        rootMargin: '10%',
    })

    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage) {
            fetchNextPage().then((r) => r)
        }
    }, [entry])

    function handleVoteEvent(msg: VoteMsg) {
        // Update the query data for 'posts'
        queryClient.setQueryData<InfiniteData<PostInfo[]>>(
            ['posts'],
            (oldData) => {
                // Iterate over all pages of posts
                const updatedPages = oldData?.pages.map((page) => {
                    // Iterate over each post in a page
                    return page.map((post) => {
                        // Find the post that matches the postId from the vote message
                        if (post.postId === msg.postId) {
                            // Update vote counts based on the action in the vote message
                            switch (msg.vote) {
                                case VoteAction.UPVOTE:
                                    post.upCount += 1
                                    break
                                case VoteAction.DOWNVOTE:
                                    post.downCount += 1
                                    break
                                case VoteAction.CANCEL_UPVOTE:
                                    post.upCount -= 1
                                    break
                                case VoteAction.CANCEL_DOWNVOTE:
                                    post.downCount -= 1
                                    break
                                // Add any other vote actions if needed
                            }
                        }
                        return post // Return the updated or original post
                    })
                })

                // Return the updated data structure expected by React Query
                return {
                    pages: updatedPages ?? [],
                    pageParams: oldData?.pageParams ?? [],
                }
            },
        )
    }

    useVoteEvents(handleVoteEvent)

    return (
        <div>
            <ul className="space-y-3 md:space-y-6">
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
