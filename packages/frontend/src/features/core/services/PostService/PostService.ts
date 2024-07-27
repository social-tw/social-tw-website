import { RelayCreatePostResponse } from '@/types/api'
import { RelayRawPost } from '@/types/Post'
import { stringifyBigInts } from '@unirep/utils'
import { RelayApiService } from '../RelayApiService/RelayApiService'

export class PostService extends RelayApiService {
    async fetchPosts(page: number) {
        const client = this.getClient()
        const response = await client.get<RelayRawPost[]>(`/post?page=${page}`)
        return response.data
    }

    async fetchPostById(id: string) {
        const client = this.getClient()
        const response = await client.get<RelayRawPost>(`/post/${id}`)
        return response.data
    }

    async createPost(content: string, identityNonce: number) {
        const client = this.getClientWithPositiveReputation()

        const userState = this.getUserState()
        const { publicSignals, proof, epoch, epochKey } =
            await userState.genEpochKeyProof({
                nonce: identityNonce,
            })

        const response = await client.post<RelayCreatePostResponse>(
            '/post',
            stringifyBigInts({
                publicSignals,
                proof,
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
}
