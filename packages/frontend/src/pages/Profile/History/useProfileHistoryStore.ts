import { UserState } from '@unirep/core'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Directions, SortKeys } from '../../../types/api'
import { fetchPostsByEpochKeys } from '../../../utils/api'
import { Comment } from './DTO/Comment'
import { Post } from './DTO/Post'
import { Vote } from './DTO/Vote'
import { ProfileHistoryStoreParser } from './ProfileHistoryStoreParser'

enum ActiveTab {
    Post = 'POST',
    Comment = 'COMMENT',
    Vote = 'VOTE',
}
enum ActiveFilter {
    Latest = 'LATEST',
    Oldest = 'OLDEST',
    Popularity = 'POPULARITY',
}

interface ProfileHistoryState {
    activeTab: ActiveTab
    posts: {
        activeFilter: ActiveFilter
        isFetching: boolean
        isInit: boolean
        data: Post[]
    }
    comments: {
        activeFilter: ActiveFilter
        data: Comment[]
    }
    votes: {
        activeFilter: Omit<ActiveFilter, ActiveFilter.Popularity>
        data: Vote[]
    }
}

interface ProfileHistoryActions {
    setActiveTabToPost: () => void
    setActiveTabToComment: () => void
    setActiveTabToVote: () => void
    setPostActiveFilterToLatest: () => void
    setPostActiveFilterToOldest: () => void
    setPostActiveFilterToPopularity: () => void
    setCommentActiveFilterToLatest: () => void
    setCommentActiveFilterToOldest: () => void
    setCommentActiveFilterToPopularity: () => void
    setVoteActiveFilterToLatest: () => void
    setVoteActiveFilterToOldest: () => void
    fetchPosts: (userState: UserState) => Promise<void>
}

export const useProfileHistory = create<
    ProfileHistoryState & ProfileHistoryActions
>()(
    immer((set, get) => ({
        activeTab: ActiveTab.Post,
        posts: {
            activeFilter: ActiveFilter.Latest,
            isFetching: false,
            isInit: false,
            data: [],
        },
        comments: {
            activeFilter: ActiveFilter.Latest,
            data: [],
        },
        votes: {
            activeFilter: ActiveFilter.Latest,
            data: [],
        },
        setActiveTabToPost: () =>
            set((state) => {
                state.activeTab = ActiveTab.Post
            }),
        setActiveTabToComment: () =>
            set((state) => {
                state.activeTab = ActiveTab.Comment
            }),
        setActiveTabToVote: () =>
            set((state) => {
                state.activeTab = ActiveTab.Vote
            }),
        setPostActiveFilterToLatest: () =>
            set((state) => {
                state.posts.activeFilter = ActiveFilter.Latest
            }),
        setPostActiveFilterToOldest: () =>
            set((state) => {
                state.posts.activeFilter = ActiveFilter.Oldest
            }),
        setPostActiveFilterToPopularity: () =>
            set((state) => {
                state.posts.activeFilter = ActiveFilter.Popularity
            }),
        setCommentActiveFilterToLatest: () =>
            set((state) => {
                state.comments.activeFilter = ActiveFilter.Latest
            }),
        setCommentActiveFilterToOldest: () =>
            set((state) => {
                state.comments.activeFilter = ActiveFilter.Oldest
            }),
        setCommentActiveFilterToPopularity: () =>
            set((state) => {
                state.comments.activeFilter = ActiveFilter.Popularity
            }),
        setVoteActiveFilterToLatest: () =>
            set((state) => {
                state.votes.activeFilter = ActiveFilter.Latest
            }),
        setVoteActiveFilterToOldest: () =>
            set((state) => {
                state.votes.activeFilter = ActiveFilter.Oldest
            }),
        fetchPosts: async (userState: UserState) => {
            try {
                set((state) => {
                    state.posts.isFetching = true
                })
                const currentEpoch = userState.sync.calcCurrentEpoch()
                const epochKeyChunks = getEpochKeyChunks(
                    userState,
                    currentEpoch,
                    10
                )
                const batchedRawPosts = await Promise.all(
                    epochKeyChunks.map((epochKeyChunk) =>
                        fetchPostsByEpochKeys({
                            epochKeys: epochKeyChunk,
                            direction: Directions.Asc,
                            sortKey: SortKeys.PublishAt,
                        })
                    )
                )
                const batchedPosts = batchedRawPosts.map(
                    ProfileHistoryStoreParser.parseRelaySourcePostsToPosts
                )
                set((state) => {
                    state.posts.data = batchedPosts.flat(2)
                    if (!state.posts.isInit) {
                        state.posts.isInit = true
                    }
                })
            } catch (err) {
                console.log('FetchPosts Error:', err)
            } finally {
                set((state) => {
                    state.posts.isFetching = false
                })
            }
        },
    }))
)

export function useProfileHistoryActiveTab() {
    const activeTab = useProfileHistory((state) => state.activeTab)
    return {
        isPostActive: activeTab === ActiveTab.Post,
        isCommentActive: activeTab === ActiveTab.Comment,
        isVoteActive: activeTab === ActiveTab.Vote,
    }
}

export function useProfileHistoryPostActiveFilter() {
    const postActiveFilter = useProfileHistory(
        (state) => state.posts.activeFilter
    )
    return {
        isFilterLatestActive: postActiveFilter === ActiveFilter.Latest,
        isFilterOldestActive: postActiveFilter === ActiveFilter.Oldest,
        isFilterPopularityActive: postActiveFilter === ActiveFilter.Popularity,
    }
}

export function useProfileHistoryCommentActiveFilter() {
    const commentActiveFilter = useProfileHistory(
        (state) => state.comments.activeFilter
    )
    return {
        isFilterLatestActive: commentActiveFilter === ActiveFilter.Latest,
        isFilterOldestActive: commentActiveFilter === ActiveFilter.Oldest,
        isFilterPopularityActive:
            commentActiveFilter === ActiveFilter.Popularity,
    }
}

export function useProfileHistoryVoteActiveFilter() {
    const voteActiveFilter = useProfileHistory(
        (state) => state.votes.activeFilter
    )
    return {
        isFilterLatestActive: voteActiveFilter === ActiveFilter.Latest,
        isFilterOldestActive: voteActiveFilter === ActiveFilter.Oldest,
    }
}

function getEpochKeyChunks(
    userState: UserState,
    currentEpoch: number,
    chunkSize: number
): BigInt[][] {
    const epochKeys = []
    for (let i = 0; i < currentEpoch; i++) {
        const epochKeysOfCertainEpoch = userState.getEpochKeys(i)
        Array.isArray(epochKeysOfCertainEpoch)
            ? epochKeys.push(...epochKeysOfCertainEpoch)
            : epochKeys.push(epochKeysOfCertainEpoch)
    }
    const chunks = chunkData(epochKeys, chunkSize)
    return chunks
}

function chunkData<T>(data: T[], chunkSize: number): T[][] {
    const chunks = []
    let index = 0
    while (index < data.length) {
        chunks.push(data.slice(index, index + chunkSize))
        index += chunkSize
    }
    return chunks
}
