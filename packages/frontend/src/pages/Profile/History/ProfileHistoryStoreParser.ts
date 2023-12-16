import { RelayRawPost } from '../../../types/api'
import { Post } from './DTO/Post'
import { UrlGenerator } from './UrlGenerator'
import { formatDate } from './utils'

export class ProfileHistoryStoreParser {
    static parseRelayRawPostsToPosts(relayRawPosts: RelayRawPost[]): Post[] {
        return relayRawPosts.map((relaySourcePost) => {
            const date = new Date(relaySourcePost.publishedAt)
            return new Post(
                formatDate(date, 'yyyy/MM/dd'),
                relaySourcePost.content,
                relaySourcePost.epochKey,
                UrlGenerator.genPostUrlById(relaySourcePost._id),
            )
        })
    }
}
