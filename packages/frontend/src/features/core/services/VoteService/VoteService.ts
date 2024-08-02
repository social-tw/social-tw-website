import { RelayCreateVoteResponse } from '@/types/api'
import { VoteAction } from '@/types/Vote'
import { stringifyBigInts } from '@unirep/utils'
import { RelayApiService } from '../RelayApiService/RelayApiService'

export class VoteService extends RelayApiService {
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
