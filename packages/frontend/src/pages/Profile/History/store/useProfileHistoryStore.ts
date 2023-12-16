import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { ActiveFilter, ActiveTab, ProfileHistoryStore } from '../types'
import { createCommentSlice } from './createCommentSlice'
import { createPostSlice } from './createPostSlice'
import { createTabSlice } from './createTabSlice'
import { createVoteSlice } from './createVoteSlice'

export const useProfileHistoryStore = create<ProfileHistoryStore>()(
    immer((...storeApi) => ({
        ...createTabSlice(...storeApi),
        ...createPostSlice(...storeApi),
        ...createCommentSlice(...storeApi),
        ...createVoteSlice(...storeApi),
    })),
)

export function useProfileHistoryActiveTab() {
    const activeTab = useProfileHistoryStore((state) => state.activeTab)
    return {
        isPostActive: activeTab === ActiveTab.Post,
        isCommentActive: activeTab === ActiveTab.Comment,
        isVoteActive: activeTab === ActiveTab.Vote,
    }
}

export function useProfileHistoryPostActiveFilter() {
    const postActiveFilter = useProfileHistoryStore(
        (state) => state.posts.activeFilter,
    )
    return {
        isFilterLatestActive: postActiveFilter === ActiveFilter.Latest,
        isFilterOldestActive: postActiveFilter === ActiveFilter.Oldest,
        isFilterPopularityActive: postActiveFilter === ActiveFilter.Popularity,
    }
}

export function useProfileHistoryCommentActiveFilter() {
    const commentActiveFilter = useProfileHistoryStore(
        (state) => state.comments.activeFilter,
    )
    return {
        isFilterLatestActive: commentActiveFilter === ActiveFilter.Latest,
        isFilterOldestActive: commentActiveFilter === ActiveFilter.Oldest,
        isFilterPopularityActive:
            commentActiveFilter === ActiveFilter.Popularity,
    }
}

export function useProfileHistoryVoteActiveFilter() {
    const voteActiveFilter = useProfileHistoryStore(
        (state) => state.votes.activeFilter,
    )
    return {
        isFilterLatestActive: voteActiveFilter === ActiveFilter.Latest,
        isFilterOldestActive: voteActiveFilter === ActiveFilter.Oldest,
    }
}
