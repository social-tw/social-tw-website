import { ActiveFilter, StateVoteSlice } from '../types'

export const createVoteSlice: StateVoteSlice = (set) => ({
    votes: {
        activeFilter: ActiveFilter.Latest,
        data: [],
    },
    setVoteActiveFilterToLatest: () =>
        set((state) => {
            state.votes.activeFilter = ActiveFilter.Latest
        }),
    setVoteActiveFilterToOldest: () =>
        set((state) => {
            state.votes.activeFilter = ActiveFilter.Oldest
        }),
})
