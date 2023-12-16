import { RelayRawPost } from '../../../types/api'
import { Post } from './DTO/Post'

export class ProfileHistoryStoreParser {
    static parseRelaySourcePostsToPosts(relayRawPosts: RelayRawPost[]): Post[] {
        return relayRawPosts.map(
            (relaySourcePost) =>
                new Post(
                    relaySourcePost.date,
                    relaySourcePost.content,
                    relaySourcePost.epochKey,
                    relaySourcePost.url,
                ),
        )
    }
}
