import { RelayCreateCommentResponse, RelayRemoveCommentResponse } from "@/types/api";
import { RelayRawComment } from "@/types/Comments";
import { stringifyBigInts } from '@unirep/utils';
import { RelayApiService } from "../RelayApiService/RelayApiService";

export class CommentService extends RelayApiService {
    async fetchCommentsByPostId(postId: string) {
        const client = this.getClient()
        const response = await client.get<RelayRawComment[]>(`/comment?postId=${postId}`)
        return response.data
    }

    async createComment(content: string, postId: string, identityNonce: number) {
        const client = this.getClientWithPositiveReputation()

        const userState = this.getUserState()
        const { publicSignals, proof, epoch, epochKey } =
            await userState.genEpochKeyProof({
                nonce: identityNonce,
            })
        
        const response = await client.post<RelayCreateCommentResponse>(
            "/comment",
            stringifyBigInts({
                publicSignals,
                proof,
                postId,
                content,
            })
        )
        const { txHash } = response.data

        return {
            txHash,
            epoch: Number(epoch),
            epochKey: epochKey.toString(),
        }
    }

    async removeComment(commentId: string, postId: string, epoch: number, identityNonce: number) {
        const client = this.getClientWithPositiveReputation()

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
                })
            }
        )
        const { txHash } = response.data

        return {
            txHash,
            epochKey: epochKey.toString(),
        }
    }
}
