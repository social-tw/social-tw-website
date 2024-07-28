import { FetchPostHistoryResponse, FetchPostResponse, FetchPostsResponse, RelayCreatePostResponse } from '@/types/api';
import { isMyEpochKeyOnEpoch } from '@/utils/helpers/epochKey';
import { stringifyBigInts } from '@unirep/utils';
import { RelayApiService } from '../RelayApiService/RelayApiService';

export class PostService extends RelayApiService {
    async fetchPosts(page: number) {
        const client = this.getClient()
        const response = await client.get<FetchPostsResponse>(`/post?page=${page}`)
        return response.data
    }

    async fetchPostById(id: string) {
        const client = this.getClient()
        const response = await client.get<FetchPostResponse>(`/post/${id}`)
        return response.data
    }

    async fetchPostHistory(fromEpoch: number, toEpoch: number) {
        const client = this.getClient()
        const searchParams = new URLSearchParams()
        searchParams.append('from_epoch', fromEpoch.toString())
        searchParams.append('to_epoch', toEpoch.toString())
        const response = await client.get<FetchPostHistoryResponse>(
            `/post/postHistory?${searchParams.toString()}`,
        )

        return response.data
    }

    async fetchMyPostHistory(fromEpoch: number, toEpoch: number) {
        const userState = this.getUserState()
        const posts = await this.fetchPostHistory(fromEpoch, toEpoch)
        return posts.filter((post) => isMyEpochKeyOnEpoch(userState, post.epoch, post.epochKey))
    }

    async createPost({
        content,
        identityNonce,
    }: {
        content: string
        identityNonce: number
    }) {
        const client = this.getAuthClient()

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
