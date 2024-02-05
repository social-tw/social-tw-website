import { UserState } from '@unirep/core'
import { StateCreator } from 'zustand'

import type { Comment } from './DTO/Comment'
import type { Post } from './DTO/Post'
import type { Vote } from './DTO/Vote'

export enum ActiveTab {
    Post = 'Post',
    Comment = 'Comment',
    Vote = 'Vote',
}
export enum ActiveFilter {
    DateAsc = 'DateAsc',
    DateDesc = 'DateDesc',
    PopularityAsc = 'PopularityAsc',
}

export enum VoteType {
    Upvote = 'Upvote',
    Downvote = 'Downvote',
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
    setPostActiveFilterToDateAsc: () => void
    setPostActiveFilterToDateDesc: () => void
    setPostActiveFilterToPopularityAsc: () => void
    invokeFetchHistoryPostsFlow: (userState: UserState) => Promise<void>
    invokeRefetchHistoryPostsFlow: (userState: UserState) => Promise<void>
    invokeInitHistoryPostsFlow: (userState: UserState) => Promise<void>
}

interface CommentSlice {
    comments: {
        activeFilter: ActiveFilter
        isFetching: boolean
        isInit: boolean
        data: Comment[]
    }
    setCommentActiveFilterToDateAsc: () => void
    setCommentActiveFilterToDateDesc: () => void
    setCommentActiveFilterToPopularityAsc: () => void
    invokeInitHistoryCommentsFlow: (userState: UserState) => Promise<void>
}

interface VoteSlice {
    votes: {
        activeFilter: Exclude<ActiveFilter, ActiveFilter.PopularityAsc>
        isFetching: boolean
        isInit: boolean
        data: Vote[]
    }
    setVoteActiveFilterToDateAsc: () => void
    setVoteActiveFilterToDateDesc: () => void
    invokeInitHistoryVotesFlow: (userState: UserState) => Promise<void>
}
