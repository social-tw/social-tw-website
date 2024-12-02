import {
    FetchPostHistoryResponse,
    FetchPostResponse,
    FetchPostsResponse,
    RelayCreatePostResponse,
} from '@/types/api'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { stringifyBigInts } from '@unirep/utils'
import { RelayApiService } from '../RelayApiService/RelayApiService'

export class PostService extends RelayApiService {
    async fetchPosts(page: number, query?: string) {
        const client = this.getClient()
        const response = await client.get<FetchPostsResponse>(
            `/post?page=${page}`,
        )
        //TODO: After relay update change to
        // const params = new URLSearchParams({ page: page.toString() })
        // if (query) {
        //     params.append('query', query)
        // }
        // const response = await client.get<FetchPostsResponse>(
        //     `/post?page=${page}&query={query}`,
        // )
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
        return posts.filter((post) =>
            isMyEpochKey(userState, post.epoch, post.epochKey),
        )
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
