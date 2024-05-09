import { UserState } from '@unirep/core'
import dayjs from 'dayjs'

import { fetchVotesByEpochKeys } from '../../../../utils/api'
import { ErrorUnsupportedVoteType } from '../errors/ErrorUnsupportedVoteType'
import { ActiveFilter, VoteType } from '../types'
import { fetchAllByEpochKeysInBatches } from '../utils'
import { RelayRawVote, VoteHistoryMetaData } from '@/types/Vote'

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
        votes: VoteHistoryMetaData[],
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

    isUpvote(vote: VoteHistoryMetaData) {
        return vote.type === VoteType.Upvote
    }

    private sortVotesByDateAsc(votes: VoteHistoryMetaData[]) {
        return votes.sort((a, b) => b.publishedAt - a.publishedAt)
    }

    private sortVotesByDateDesc(votes: VoteHistoryMetaData[]) {
        return votes.sort((a, b) => a.publishedAt - b.publishedAt)
    }

    private parseRelayRawVotesToVotes(relayRawVotes: RelayRawVote[]): VoteHistoryMetaData[] {
        return relayRawVotes.map((relayRawVote) => {
            const publishedAt = parseInt(relayRawVote.publishedAt)
            const voteType = this.getVoteTypeByRelayRawVote(relayRawVote)
            return new VoteHistoryMetaData(
                relayRawVote.epochKey,
                publishedAt,
                dayjs(publishedAt).format('YYYY/MM/DD'),
                this.genVoteUrlByPostId(relayRawVote.postId),
                voteType,
            )
        })
    }

    private genVoteUrlByPostId(postId: string): string {
        return `/posts/${postId}`
    }

    private getVoteTypeByRelayRawVote(relayRawVote: RelayRawVote): VoteType {
        if (relayRawVote.upVote === 1) {
            return VoteType.Upvote
        } else if (relayRawVote.downVote === 1) {
            return VoteType.Downvote
        } else {
            throw new ErrorUnsupportedVoteType()
        }
    }
}
