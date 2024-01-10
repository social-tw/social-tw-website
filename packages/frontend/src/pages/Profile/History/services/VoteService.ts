import { UserState } from '@unirep/core'
import dayjs from 'dayjs'

import { RelayRawVote, RelayRawVoteType } from '../../../../types/api'
import { fetchVotesByEpochKeys } from '../../../../utils/api'
import { Vote } from '../DTO/Vote'
import { ActiveFilter, VoteType } from '../types'
import { fetchAllByEpochKeysInBatches } from '../utils'

export class VoteService {
    async fetchVoteHistoryByUserState(userState: UserState) {
        const chunkSize = 50
        const batchedRawVotes = await fetchAllByEpochKeysInBatches(
            userState,
            chunkSize,
            fetchVotesByEpochKeys,
        )
        return batchedRawVotes
            .map(this.parseRelayRawVotesToVotes.bind(this))
            .flat(2)
    }

    sortVotes(
        votes: Vote[],
        activeFilter: Exclude<ActiveFilter, ActiveFilter.PopularityAsc>,
    ) {
        switch (activeFilter) {
            case ActiveFilter.DateAsc: {
                return this.sortVotesByDateAsc(votes)
            }
            case ActiveFilter.DateDesc: {
                return this.sortVotesByDateDesc(votes)
            }
            default: {
                return votes
            }
        }
    }

    isUpvote(vote: Vote) {
        return vote.type === VoteType.Upvote
    }

    private sortVotesByDateAsc(votes: Vote[]) {
        return votes.sort((a, b) => b.publishedAt - a.publishedAt)
    }

    private sortVotesByDateDesc(votes: Vote[]) {
        return votes.sort((a, b) => a.publishedAt - b.publishedAt)
    }

    private parseRelayRawVotesToVotes(relayRawVotes: RelayRawVote[]): Vote[] {
        return relayRawVotes.map((relayRawVote) => {
            const publishedAt = parseInt(relayRawVote.publishedAt)
            const voteType =
                relayRawVote.type === RelayRawVoteType.Upvote
                    ? VoteType.Upvote
                    : VoteType.Downvote
            return new Vote(
                relayRawVote._id,
                relayRawVote.epochKey,
                publishedAt,
                relayRawVote.content,
                relayRawVote.voteSum,
                dayjs(publishedAt).format('YYYY/MM/DD'),
                this.genVoteUrlById(relayRawVote._id),
                voteType,
            )
        })
    }

    // TODO: confirm url
    private genVoteUrlById(id: string): string {
        return `/votes/${id}`
    }
}
