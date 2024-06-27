import { UserState } from '@unirep/core'
import { CommentService } from '../services/CommentService'
import { ActiveFilter, StateCommentSlice } from '../utils/types'

export const createCommentSlice: StateCommentSlice = (set, get) => ({
    comments: {
        activeFilter: ActiveFilter.DateAsc,
        isFetching: false,
        isInit: false,
        data: [],
    },
    setCommentActiveFilterToDateAsc: () => {
        set((state) => {
            const comments = state.comments.data
            const commentService = new CommentService()
            const sortedComments = commentService.sortComments(
                comments,
                ActiveFilter.DateAsc,
            )
            state.comments.activeFilter = ActiveFilter.DateAsc
            state.comments.data = sortedComments
        })
    },
    setCommentActiveFilterToDateDesc: () => {
        set((state) => {
            const comments = state.comments.data
            const commentService = new CommentService()
            const sortedComments = commentService.sortComments(
                comments,
                ActiveFilter.DateDesc,
            )
            state.comments.activeFilter = ActiveFilter.DateDesc
            state.comments.data = sortedComments
        })
    },
    setCommentActiveFilterToPopularityAsc: () => {
        set((state) => {
            const comments = state.comments.data
            const commentService = new CommentService()
            const sortedComments = commentService.sortComments(
                comments,
                ActiveFilter.PopularityAsc,
            )
            state.comments.activeFilter = ActiveFilter.PopularityAsc
            state.comments.data = sortedComments
        })
    },
    invokeFetchHistoryCommentsFlow: async (userState: UserState) => {
        const isInit = get().comments.isInit
        if (!isInit) {
            await get().invokeInitHistoryCommentsFlow(userState)
        } else {
            await get().invokeRefetchHistoryCommentsFlow(userState)
        }
    },
    invokeRefetchHistoryCommentsFlow: async (userState: UserState) => {
        try {
            set((state) => {
                state.comments.isFetching = true
            })
            const activeFilter = get().comments.activeFilter
            const sortedComments = await _fetchHistoryCommentsAndSorted(
                userState,
                activeFilter,
            )
            set((state) => {
                state.comments.data = sortedComments
            })
        } finally {
            set((state) => {
                state.comments.isFetching = false
            })
        }
    },
    invokeInitHistoryCommentsFlow: async (userState: UserState) => {
        try {
            set((state) => {
                state.comments.isFetching = true
            })
            const activeFilter = get().comments.activeFilter
            const sortedComments = await _fetchHistoryCommentsAndSorted(
                userState,
                activeFilter,
            )
            set((state) => {
                state.comments.data = sortedComments
                state.comments.isInit = true
            })
        } catch (err) {
            console.error('Init History Comments Error:', err)
        } finally {
            set((state) => {
                state.comments.isFetching = false
            })
        }
    },
})

async function _fetchHistoryCommentsAndSorted(
    userState: UserState,
    activeFilter: ActiveFilter,
) {
    const commentService = new CommentService()
    const comments = await commentService.fetchCommentHistoryByUserState(
        userState,
    )
    const sortedComments = commentService.sortComments(comments, activeFilter)
    return sortedComments
}
