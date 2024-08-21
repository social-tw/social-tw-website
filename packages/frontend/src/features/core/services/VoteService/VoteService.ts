import { FetchVoteHistoryResponse, RelayCreateVoteResponse } from '@/types/api'
import { RelayRawVote, VoteAction } from '@/types/Vote'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { stringifyBigInts } from '@unirep/utils'
import { RelayApiService } from '../RelayApiService/RelayApiService'

export class VoteService extends RelayApiService {
    static isUpVote(vote: RelayRawVote) {
        return vote.upVote === 1
    }

    static isDownVote(vote: RelayRawVote) {
        return vote.downVote === 1
    }

    async fetchVoteHistory(fromEpoch: number, toEpoch: number) {
        const client = this.getClient()
        const searchParams = new URLSearchParams()
        searchParams.append('from_epoch', fromEpoch.toString())
        searchParams.append('to_epoch', toEpoch.toString())
        const response = await client.get<FetchVoteHistoryResponse>(
            `/vote/VoteHistory?${searchParams.toString()}`,
        )

        return response.data
    }

    async fetchMyVoteHistory(fromEpoch: number, toEpoch: number) {
        const userState = this.getUserState()
        const votes = await this.fetchVoteHistory(fromEpoch, toEpoch)
        return votes.filter((vote) =>
            isMyEpochKey(userState, vote.epoch, vote.epochKey),
        )
    }

    async createVote({
        postId,
        voteAction,
        epoch,
        identityNonce,
    }: {
        postId: string
        voteAction: VoteAction
        epoch?: number
        identityNonce?: number
    }) {
        const client = this.getAuthClient()

        const userState = this.getUserState()
        const { publicSignals, proof } = await userState.genEpochKeyLiteProof({
            epoch: epoch,
            nonce: identityNonce,
        })

        const response = await client.post<RelayCreateVoteResponse>(
            '/vote',
            stringifyBigInts({
                postId,
                voteAction,
                publicSignals,
                proof,
            }),
        )

        return response.data
    }
}
