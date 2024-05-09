import { UserState } from '@unirep/core'
import dayjs from 'dayjs'
import { fetchPostsByEpochKeys } from '../../../../utils/api'
import { ActiveFilter } from '../types'
import { fetchAllByEpochKeysInBatches } from '../utils'
import { PostHistoryMetaData, RelayRawPost } from '@/types/Post'

export class PostService {
    async fetchPostHistoryByUserState(userState: UserState) {
        const chunkSize = 50
        const batchedRawPosts = await fetchAllByEpochKeysInBatches(
            userState,
            chunkSize,
            fetchPostsByEpochKeys,
        )
        return batchedRawPosts
            .map(this.parseRelayRawPostsToPosts.bind(this))
            .flat(2)
    }

    sortPosts(posts: PostHistoryMetaData[], activeFilter: ActiveFilter) {
        switch (activeFilter) {
            case ActiveFilter.DateAsc: {
                return this.sortPostsByDateAsc(posts)
            }
            case ActiveFilter.DateDesc: {
                return this.sortPostsByDateDesc(posts)
            }
            case ActiveFilter.PopularityAsc: {
                return this.sortPostsByPopularityAsc(posts)
            }
            default: {
                return posts
            }
        }
    }

    private sortPostsByDateAsc(posts: PostHistoryMetaData[]) {
        return posts.sort((a, b) => b.publishedAt - a.publishedAt)
    }

    private sortPostsByDateDesc(posts: PostHistoryMetaData[]) {
        return posts.sort((a, b) => a.publishedAt - b.publishedAt)
    }

    private sortPostsByPopularityAsc(posts: PostHistoryMetaData[]) {
        return posts.sort((a, b) => b.voteSum - a.voteSum)
    }

    private parseRelayRawPostsToPosts(
        relayRawPosts: RelayRawPost[],
    ): PostHistoryMetaData[] {
        return relayRawPosts.map((relaySourcePost) => {
            const publishedAt = parseInt(relaySourcePost.publishedAt)
            return new PostHistoryMetaData(
                relaySourcePost.postId,
                relaySourcePost.epochKey,
                publishedAt,
                relaySourcePost.content,
                relaySourcePost.voteSum,
                dayjs(publishedAt).format('YYYY/MM/DD'),
                this.genPostUrlById(relaySourcePost.postId),
            )
        })
    }

    private genPostUrlById(id: string): string {
        return `/posts/${id}`
    }
}
