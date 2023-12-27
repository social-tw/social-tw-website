import { UserState } from '@unirep/core'
import dayjs from 'dayjs'

import { RelayRawPost } from '../../../../types/api'
import { fetchPostsByEpochKeys } from '../../../../utils/api'
import { Post } from '../DTO/Post'
import { ActiveFilter } from '../types'
import { fetchAllByEpochKeysInBatches } from '../utils'

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

    sortPosts(posts: Post[], activeFilter: ActiveFilter) {
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

    private sortPostsByDateAsc(posts: Post[]) {
        return posts.sort((a, b) => b.publishedAt - a.publishedAt)
    }

    private sortPostsByDateDesc(posts: Post[]) {
        return posts.sort((a, b) => a.publishedAt - b.publishedAt)
    }

    private sortPostsByPopularityAsc(posts: Post[]) {
        return posts.sort((a, b) => b.voteSum - a.voteSum)
    }

    private parseRelayRawPostsToPosts(relayRawPosts: RelayRawPost[]): Post[] {
        return relayRawPosts.map((relaySourcePost) => {
            return new Post(
                relaySourcePost._id,
                relaySourcePost.epochKey,
                relaySourcePost.publishedAt,
                relaySourcePost.content,
                relaySourcePost.voteSum,
                dayjs(relaySourcePost.publishedAt).format('YYYY/MM/DD'),
                this.genPostUrlById(relaySourcePost._id),
            )
        })
    }

    private genPostUrlById(id: string): string {
        return `/posts/${id}`
    }
}
