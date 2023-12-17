import { UserState } from '@unirep/core'
import { VoteService } from '../services/VoteService'
import { ActiveFilter, StateVoteSlice } from '../types'

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
    invokeInitHistoryVotesFlow: async (userState: UserState) => {
        try {
            set((state) => {
                state.votes.isFetching = true
            })
            const voteService = new VoteService()
            const votes =
                await voteService.fetchVoteHistoryByUserState(userState)
            const sortedVotes = voteService.sortVotes(
                votes,
                get().votes.activeFilter,
            )
            set((state) => {
                state.votes.data = sortedVotes
                state.votes.isInit = true
            })
        } catch (err) {
            console.error('Init History Votes Error:', err)
        } finally {
            set((state) => {
                state.votes.isFetching = false
            })
        }
    },
})
