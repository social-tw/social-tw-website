import { UserState } from '@unirep/core'
import { StateCreator } from 'zustand'

import type { Comment } from './DTO/Comment'
import type { Post } from './DTO/Post'
import type { Vote } from './DTO/Vote'

export enum ActiveTab {
    Post = 'POST',
    Comment = 'COMMENT',
    Vote = 'VOTE',
}
export enum ActiveFilter {
    Latest = 'LATEST',
    Oldest = 'OLDEST',
    Popularity = 'POPULARITY',
}

export type ProfileHistoryStore = TabSlice &
    PostSlice &
    CommentSlice &
    VoteSlice

export type StateTabSlice = StateCreator<
    TabSlice,
    [['zustand/immer', never]],
    [],
    TabSlice
>

export type StatePostSlice = StateCreator<
    PostSlice,
    [['zustand/immer', never]],
    [],
    PostSlice
>

export type StateCommentSlice = StateCreator<
    CommentSlice,
    [['zustand/immer', never]],
    [],
    CommentSlice
>

export type StateVoteSlice = StateCreator<
    VoteSlice,
    [['zustand/immer', never]],
    [],
    VoteSlice
>

interface TabSlice {
    activeTab: ActiveTab
    setActiveTabToPost: () => void
    setActiveTabToComment: () => void
    setActiveTabToVote: () => void
}

interface PostSlice {
    posts: {
        activeFilter: ActiveFilter
        isFetching: boolean
        isInit: boolean
        data: Post[]
    }
    setPostActiveFilterToLatest: () => void
    setPostActiveFilterToOldest: () => void
    setPostActiveFilterToPopularity: () => void
    fetchPosts: (userState: UserState) => Promise<void>
}

interface CommentSlice {
    comments: {
        activeFilter: ActiveFilter
        data: Comment[]
    }
    setCommentActiveFilterToLatest: () => void
    setCommentActiveFilterToOldest: () => void
    setCommentActiveFilterToPopularity: () => void
}

interface VoteSlice {
    votes: {
        activeFilter: Omit<ActiveFilter, ActiveFilter.Popularity>
        data: Vote[]
    }
    setVoteActiveFilterToLatest: () => void
    setVoteActiveFilterToOldest: () => void
}
