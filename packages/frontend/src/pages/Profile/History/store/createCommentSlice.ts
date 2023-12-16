import { ActiveFilter, StateCommentSlice } from '../types'

export const createCommentSlice: StateCommentSlice = (set) => ({
    comments: {
        activeFilter: ActiveFilter.Latest,
        data: [],
    },
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
})
