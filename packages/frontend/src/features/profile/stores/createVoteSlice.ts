import { UserState } from '@unirep/core'
import { VoteService } from '../services/VoteService'
import { ActiveFilter, StateVoteSlice } from '../utils/types'

export const createVoteSlice: StateVoteSlice = (set, get) => ({
    votes: {
        activeFilter: ActiveFilter.DateAsc,
        isFetching: false,
        isInit: false,
        data: [],
    },
    setVoteActiveFilterToDateAsc: () => {
        set((state) => {
            const votes = state.votes.data
            const voteService = new VoteService()
            const sortedVotes = voteService.sortVotes(
                votes,
                ActiveFilter.DateAsc,
            )
            state.votes.activeFilter = ActiveFilter.DateAsc
            state.votes.data = sortedVotes
        })
    },
    setVoteActiveFilterToDateDesc: () => {
        set((state) => {
            const votes = state.votes.data
            const voteService = new VoteService()
            const sortedVotes = voteService.sortVotes(
                votes,
                ActiveFilter.DateDesc,
            )
            state.votes.activeFilter = ActiveFilter.DateDesc
            state.votes.data = sortedVotes
        })
    },
    invokeFetchHistoryVotesFlow: async (userState: UserState) => {
        const isInit = get().votes.isInit
        if (!isInit) {
            await get().invokeInitHistoryVotesFlow(userState)
        } else {
            await get().invokeRefetchHistoryVotesFlow(userState)
        }
    },
    invokeRefetchHistoryVotesFlow: async (userState: UserState) => {
        try {
            set((state) => {
                state.votes.isFetching = true
            })
            const activeFilter = get().votes.activeFilter
            const sortedVotes = await _fetchHistoryVotesAndSorted(
                userState,
                activeFilter,
            )
            set((state) => {
                state.votes.data = sortedVotes
            })
        } finally {
            set((state) => {
                state.votes.isFetching = false
            })
        }
    },
    invokeInitHistoryVotesFlow: async (userState: UserState) => {
        try {
            set((state) => {
                state.votes.isFetching = true
            })
            const activeFilter = get().votes.activeFilter
            const sortedVotes = await _fetchHistoryVotesAndSorted(
                userState,
                activeFilter,
            )
            set((state) => {
                state.votes.data = sortedVotes
                state.votes.isInit = true
            })
        } finally {
            set((state) => {
                state.votes.isFetching = false
            })
        }
    },
})

async function _fetchHistoryVotesAndSorted(
    userState: UserState,
    activeFilter: Exclude<ActiveFilter, ActiveFilter.PopularityAsc>,
) {
    const voteService = new VoteService()
    const votes = await voteService.fetchVoteHistoryByUserState(userState)
    const sortedVotes = voteService.sortVotes(votes, activeFilter)
    return sortedVotes
}
