import { UserState } from '@unirep/core'
import { CommentService } from '../services/CommentService'
import { ActiveFilter, StateCommentSlice } from '../types'

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
    invokeInitHistoryCommentsFlow: async (userState: UserState) => {
        try {
            set((state) => {
                state.comments.isFetching = true
            })
            const commentService = new CommentService()
            const comments =
                await commentService.fetchCommentHistoryByUserState(userState)
            const sortedComments = commentService.sortComments(
                comments,
                get().comments.activeFilter,
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
