import { ActiveFilter, StateVoteSlice } from '../types'

export const createVoteSlice: StateVoteSlice = (set) => ({
    votes: {
        activeFilter: ActiveFilter.DateAsc,
        data: [],
    },
    setVoteActiveFilterToLatest: () =>
        set((state) => {
            state.votes.activeFilter = ActiveFilter.DateAsc
        }),
    setVoteActiveFilterToOldest: () =>
        set((state) => {
            state.votes.activeFilter = ActiveFilter.DateDesc
        }),
})
