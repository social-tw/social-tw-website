import { DB } from 'anondb'
import { Helia } from 'helia'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import {
    CommentNotExistError,
    InvalidEpochKeyError,
    InvalidEpochRangeError,
    NoCommentHistoryFoundError,
} from '../types'
import { Comment, CommentStatus } from '../types/Comment'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import IpfsHelper from './utils/IpfsHelper'
import ProofHelper from './utils/ProofHelper'
import TransactionManager from './utils/TransactionManager'

export class CommentService {
    private filterCommentContent(comment: Comment): Partial<Comment> {
        if (comment.status === CommentStatus.ON_CHAIN) {
            return comment
        } else if (comment.status === CommentStatus.REPORTED) {
            const { content, ...restOfComment } = comment
            return restOfComment
        }
        return {}
    }

    async fetchComments(postId: string, db: DB): Promise<Partial<Comment>[]> {
        const comments = await db.findMany('Comment', {
            where: {
                status: {
                    $in: [CommentStatus.ON_CHAIN, CommentStatus.REPORTED],
                },
                postId: postId,
            },
            orderBy: {
                publishedAt: 'desc',
            },
        })

        return comments.map((comment) => this.filterCommentContent(comment))
    }

    async fetchSingleComment(
        commentId: string,
        db: DB,
        status?: CommentStatus
    ): Promise<Partial<Comment> | null> {
        const whereClause: any = { commentId }
        if (status !== undefined) {
            whereClause.status = status
        }

        const comment = await db.findOne('Comment', { where: whereClause })
        return comment ? this.filterCommentContent(comment) : {}
    }

    async fetchMyAccountComments(
        epks: string[],
        sortKey: 'publishedAt' | 'voteSum',
        direction: 'asc' | 'desc',
        db: DB
    ): Promise<Partial<Comment>[]> {
        const comments = await db.findMany('Comment', {
            where: {
                epochKey: epks,
                status: {
                    $in: [
                        CommentStatus.NOT_ON_CHAIN,
                        CommentStatus.ON_CHAIN,
                        CommentStatus.REPORTED,
                    ],
                },
            },
            orderBy: {
                [sortKey]: direction,
            },
        })

        return comments.map((comment) => this.filterCommentContent(comment))
    }

    async leaveComment(
        postId: string,
        content: string,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        db: DB,
        synchronizer: UnirepSocialSynchronizer,
        helia: Helia
    ) {
        const epochKeyProof = await ProofHelper.getAndVerifyEpochKeyProof(
            publicSignals,
            proof,
            synchronizer
        )

        // store content into helia ipfs node with json plain
        const cid = (
            await IpfsHelper.createIpfsContent(helia, content)
        ).toString()
        const txHash = await TransactionManager.callContract('leaveComment', [
            publicSignals,
            proof,
            postId,
            cid,
        ])

        const epoch = Number(epochKeyProof.epoch)
        const epochKey = epochKeyProof.epochKey.toString()

        // save comment into db
        await db.create('Comment', {
            postId: postId,
            content: content,
            cid: cid,
            epochKey: epochKey,
            epoch: epoch,
            transactionHash: txHash,
            status: 0,
        })

        return txHash
    }

    async deleteComment(
        commentId: string,
        postId: string,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer,
        db: DB
    ) {
        const comment: Comment = await db.findOne('Comment', {
            where: {
                status: 1,
                commentId: commentId,
                postId: postId,
            },
        })
        if (!comment) {
            throw CommentNotExistError
        }

        const epochKeyLiteProof =
            await ProofHelper.getAndVerifyEpochKeyLiteProof(
                publicSignals,
                proof,
                synchronizer
            )

        if (epochKeyLiteProof.epochKey.toString() !== comment.epochKey) {
            throw InvalidEpochKeyError
        }

        const txHash = await TransactionManager.callContract('editComment', [
            epochKeyLiteProof.publicSignals,
            epochKeyLiteProof.proof,
            comment.postId,
            commentId,
            '',
        ])

        return txHash
    }

    async updateCommentStatus(commentId: string, status: number, db: DB) {
        await db.update('Comment', {
            where: {
                commentId,
            },
            update: {
                status,
            },
        })
    }

    async getCommentHistory(
        fromEpoch: number,
        toEpoch: number,
        db: DB
    ): Promise<Comment[]> {
        if (fromEpoch > toEpoch || fromEpoch < 0 || toEpoch < 0)
            throw InvalidEpochRangeError

        const comments = await db.findMany('Comment', {
            where: {
                epoch: { gte: fromEpoch, lte: toEpoch },
            },
            orderBy: {
                epoch: 'asc',
            },
        })

        if (comments.length === 0) throw NoCommentHistoryFoundError

        return comments
    }
}

export const commentService = new CommentService()
