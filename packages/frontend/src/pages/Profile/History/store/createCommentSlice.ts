import { ActiveFilter, StateCommentSlice } from '../types'

export const createCommentSlice: StateCommentSlice = (set) => ({
    comments: {
        activeFilter: ActiveFilter.DateAsc,
        data: [],
    },
    setCommentActiveFilterToLatest: () =>
        set((state) => {
            state.comments.activeFilter = ActiveFilter.DateAsc
        }),
    setCommentActiveFilterToOldest: () =>
        set((state) => {
            state.comments.activeFilter = ActiveFilter.DateDesc
        }),
    setCommentActiveFilterToPopularity: () =>
        set((state) => {
            state.comments.activeFilter = ActiveFilter.PopularityAsc
        }),
})
