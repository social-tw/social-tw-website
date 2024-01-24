import { UserState } from '@unirep/core'
import dayjs from 'dayjs'

import { RelayRawComment } from '../../../../types/api'
import { fetchCommentsByEpochKeys } from '../../../../utils/api'
import { Comment } from '../DTO/Comment'
import { ActiveFilter } from '../types'
import { fetchAllByEpochKeysInBatches } from '../utils'

export class CommentService {
    async fetchCommentHistoryByUserState(userState: UserState) {
        const chunkSize = 50
        const batchedRawComments = await fetchAllByEpochKeysInBatches(
            userState,
            chunkSize,
            fetchCommentsByEpochKeys,
        )
        return batchedRawComments
            .map(this.parseRelayRawCommentsToComments.bind(this))
            .flat(2)
    }

    sortComments(comments: Comment[], activeFilter: ActiveFilter) {
        switch (activeFilter) {
            case ActiveFilter.DateAsc: {
                return this.sortCommentsByDateAsc(comments)
            }
            case ActiveFilter.DateDesc: {
                return this.sortCommentsByDateDesc(comments)
            }
            case ActiveFilter.PopularityAsc: {
                return this.sortCommentsByPopularityAsc(comments)
            }
            default: {
                return comments
            }
        }
    }

    private sortCommentsByDateAsc(comments: Comment[]) {
        return comments.sort((a, b) => b.publishedAt - a.publishedAt)
    }

    private sortCommentsByDateDesc(comments: Comment[]) {
        return comments.sort((a, b) => a.publishedAt - b.publishedAt)
    }

    private sortCommentsByPopularityAsc(comments: Comment[]) {
        return comments.sort((a, b) => b.voteSum - a.voteSum)
    }

    private parseRelayRawCommentsToComments(
        relayRawComments: RelayRawComment[],
    ): Comment[] {
        return relayRawComments.map((relayRawComment) => {
            const publishedAt = parseInt(relayRawComment.publishedAt)
            return new Comment(
                relayRawComment._id,
                relayRawComment.epochKey,
                publishedAt,
                relayRawComment.content,
                relayRawComment.voteSum,
                dayjs(publishedAt).format('YYYY/MM/DD'),
                this.genCommentUrlById(relayRawComment._id),
            )
        })
    }

    // TODO: confirm url
    private genCommentUrlById(id: string): string {
        return `/comments/${id}`
    }
}
