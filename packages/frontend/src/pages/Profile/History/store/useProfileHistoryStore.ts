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
        isFilterDateAscActive: postActiveFilter === ActiveFilter.DateAsc,
        isFilterDateDescActive: postActiveFilter === ActiveFilter.DateDesc,
        isFilterPopularityAscActive:
            postActiveFilter === ActiveFilter.PopularityAsc,
    }
}

export function useProfileHistoryCommentActiveFilter() {
    const commentActiveFilter = useProfileHistoryStore(
        (state) => state.comments.activeFilter,
    )
    return {
        isFilterDateAscActive: commentActiveFilter === ActiveFilter.DateAsc,
        isFilterDateDescActive: commentActiveFilter === ActiveFilter.DateDesc,
        isFilterPopularityAscActive:
            commentActiveFilter === ActiveFilter.PopularityAsc,
    }
}

export function useProfileHistoryVoteActiveFilter() {
    const voteActiveFilter = useProfileHistoryStore(
        (state) => state.votes.activeFilter,
    )
    return {
        isFilterDateAscActive: voteActiveFilter === ActiveFilter.DateAsc,
        isFilterDateDescActive: voteActiveFilter === ActiveFilter.DateDesc,
    }
}
