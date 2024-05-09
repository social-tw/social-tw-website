import { UserState } from '@unirep/core'
import dayjs from 'dayjs'

import { fetchCommentsByEpochKeys } from '../../../../utils/api'
import { ActiveFilter } from '../types'
import { fetchAllByEpochKeysInBatches } from '../utils'
import { CommentHistoryMetaData, RelayRawComment } from '@/types/Comments'

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

    sortComments(comments: CommentHistoryMetaData[], activeFilter: ActiveFilter) {
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

    private sortCommentsByDateAsc(comments: CommentHistoryMetaData[]) {
        return comments.sort((a, b) => b.publishedAt - a.publishedAt)
    }

    private sortCommentsByDateDesc(comments: CommentHistoryMetaData[]) {
        return comments.sort((a, b) => a.publishedAt - b.publishedAt)
    }

    private sortCommentsByPopularityAsc(comments: CommentHistoryMetaData[]) {
        return comments.sort((a, b) => b.voteSum - a.voteSum)
    }

    private parseRelayRawCommentsToComments(
        relayRawComments: RelayRawComment[],
    ): CommentHistoryMetaData[] {
        return relayRawComments.map((relayRawComment) => {
            const publishedAt = parseInt(relayRawComment.publishedAt)
            return new CommentHistoryMetaData(
                relayRawComment.commentId,
                relayRawComment.postId,
                relayRawComment.epochKey,
                publishedAt,
                relayRawComment.content,
                relayRawComment.voteSum,
                dayjs(publishedAt).format('YYYY/MM/DD'),
                this.genCommentUrlById(
                    relayRawComment.postId,
                    relayRawComment.commentId,
                ),
            )
        })
    }

    private genCommentUrlById(postId: string, commentId: string): string {
        return `/posts/${postId}#${commentId}`
    }
}
