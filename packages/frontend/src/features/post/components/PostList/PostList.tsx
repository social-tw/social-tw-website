import { nanoid } from 'nanoid'
import { Fragment, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIntersectionObserver } from '@uidotdev/usehooks'
import {
    DefaultError,
    InfiniteData,
    QueryKey,
    useInfiniteQuery,
    useQueryClient,
} from '@tanstack/react-query'
import {
    ActionStatus,
    postActionsSelector,
    PostData,
    useActionStore,
    useUserState,
} from '@/features/core'
import { Post, useVoteEvents, useVotes } from '@/features/post'
import { SERVER } from '@/constants/config'
import { QueryKeys } from '@/constants/queryKeys'
import checkVoteIsMine from '@/utils/helpers/checkVoteIsMine'
import { FetchPostsResponse } from '@/types/api'
import { PostInfo, PostStatus } from '@/types/Post'
import { handleVoteEvent } from '@/utils/handleVoteEvent'
import { VoteAction } from '@/types/Vote'

export default function PostList() {
    const { userState } = useUserState()

    const queryClient = useQueryClient()

    const { data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery<
        PostInfo[],
        DefaultError,
        InfiniteData<PostInfo[]>,
        QueryKey,
        number
    >({
        queryKey: [QueryKeys.ManyPosts],
        queryFn: async ({ pageParam }) => {
            const res = await fetch(`${SERVER}/api/post?page=` + pageParam)
            const jsonData = (await res.json()) as FetchPostsResponse
            return jsonData.map((item) => {
                const voteCheck = userState
                    ? checkVoteIsMine(item.votes, userState)
                    : {
                          isMine: false,
                          finalAction: null,
                          votedNonce: null,
                          votedEpoch: null,
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
                    votedNonce: voteCheck.votedNonce,
                    votedEpoch: voteCheck.votedEpoch,
                    status: PostStatus.Success,
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
                    content: actionData.content,
                    publishedAt: action.submittedAt,
                    commentCount: 0,
                    upCount: 0,
                    downCount: 0,
                    isMine: true,
                    finalAction: null,
                    votedNonce: null,
                    votedEpoch: null,
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

    const { createVote } = useVotes()

    const handleVote = async (
        id: string,
        voteType: VoteAction,
        post: PostInfo,
    ): Promise<boolean> => {
        try {
            if (post.isMine && post.finalAction !== null) {
                const cancelAction =
                    post.finalAction === VoteAction.UPVOTE
                        ? VoteAction.CANCEL_UPVOTE
                        : VoteAction.CANCEL_DOWNVOTE

                await createVote({
                    id,
                    voteAction: cancelAction,
                    votedNonce: post.votedNonce,
                    votedEpoch: post.votedEpoch,
                })
            }
            if (voteType !== post.finalAction) {
                await createVote({
                    id,
                    voteAction: voteType,
                    votedNonce: null,
                    votedEpoch: null,
                })
            }

            refetch() // Refresh the posts data after voting

            return true
        } catch (err) {
            console.error(err)
            return false
        }
    }

    useVoteEvents((msg) => handleVoteEvent(queryClient, msg))

    return (
        <div className="px-4">
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
                            votedNonce={post.votedNonce}
                            votedEpoch={post.votedEpoch}
                            status={post.status}
                            onVote={(voteType) =>
                                handleVote(post.postId!, voteType, post)
                            }
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
                                    votedNonce={post.votedNonce}
                                    votedEpoch={post.votedEpoch}
                                    status={post.status}
                                    onComment={() => {
                                        if (!post.postId) return
                                        gotoCommentsByPostId(post.postId)
                                    }}
                                    onVote={(voteType) =>
                                        handleVote(post.postId!, voteType, post)
                                    }
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
