import {
    FetchCommentHistoryResponse,
    RelayCreateCommentResponse,
    RelayRemoveCommentResponse,
} from '@/types/api'
import { RelayRawComment } from '@/types/Comments'
import { isMyEpochKeyOnEpoch } from '@/utils/helpers/epochKey'
import { stringifyBigInts } from '@unirep/utils'
import { RelayApiService } from '../RelayApiService/RelayApiService'

export class CommentService extends RelayApiService {
    async fetchCommentsByPostId(postId: string) {
        const client = this.getClient()
        const response = await client.get<RelayRawComment[]>(
            `/comment?postId=${postId}`,
        )
        return response.data
    }

    async fetchCommentHistory(fromEpoch: number, toEpoch: number) {
        const client = this.getClient()
        const searchParams = new URLSearchParams()
        searchParams.append('from_epoch', fromEpoch.toString())
        searchParams.append('to_epoch', toEpoch.toString())
        const response = await client.get<FetchCommentHistoryResponse>(
            `/comment/commentHistory?${searchParams.toString()}`,
        )

        return response.data
    }

    async fetchMyCommentHistory(fromEpoch: number, toEpoch: number) {
        const userState = this.getUserState()
        const comments = await this.fetchCommentHistory(fromEpoch, toEpoch)
        return comments.filter((comment) =>
            isMyEpochKeyOnEpoch(userState, comment.epoch, comment.epochKey),
        )
    }

    async createComment({
        content,
        postId,
        identityNonce,
    }: {
        content: string
        postId: string
        identityNonce: number
    }) {
        const client = this.getAuthClient()

        const userState = this.getUserState()
        const { publicSignals, proof, epoch, epochKey } =
            await userState.genEpochKeyProof({
                nonce: identityNonce,
            })

        const response = await client.post<RelayCreateCommentResponse>(
            '/comment',
            stringifyBigInts({
                publicSignals,
                proof,
                postId,
                content,
            }),
        )
        const { txHash } = response.data

        return {
            txHash,
            epoch: Number(epoch),
            epochKey: epochKey.toString(),
        }
    }

    async removeComment({
        commentId,
        postId,
        epoch,
        identityNonce,
    }: {
        commentId: string
        postId: string
        epoch: number
        identityNonce: number
    }) {
        const client = this.getAuthClient()

        const userState = this.getUserState()
        const { publicSignals, proof, epochKey } =
            await userState.genEpochKeyLiteProof({
                epoch,
                nonce: identityNonce,
            })

        const response = await client.delete<RelayRemoveCommentResponse>(
            `/comment`,
            {
                data: stringifyBigInts({
                    publicSignals,
                    proof,
                    commentId,
                    postId,
                }),
            },
        )
        const { txHash } = response.data

        return {
            txHash,
            epochKey: epochKey.toString(),
        }
    }
}
