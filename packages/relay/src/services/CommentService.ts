import { DB } from 'anondb'
import { PublicSignals, Groth16Proof } from 'snarkjs'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import { Helia } from 'helia'
import IpfsHelper from './utils/IpfsHelper'
import ProofHelper from './utils/ProofHelper'
import {
    CommentNotExistError,
    InvalidEpochKeyError,
} from '../types/InternalError'
import { Comment } from '../types/Comment'
import { Post } from '../types/Post'
import TransactionManager from './utils/TransactionManager'

export class CommentService {
    async fetchComments(postId: string, db: DB): Promise<Comment[]> {
        const comments = await db.findMany('Comment', {
            where: {
                status: 1,
                postId: postId,
            },
            orderBy: {
                publishedAt: 'desc',
            },
        })

        return comments
    }

    async fetchSingleComment(
        commentId: string,
        db: DB,
        status?: number
    ): Promise<Comment> {
        const comment = await db.findOne('Comment', {
            where: {
                status: 1,
                commentId: commentId,
            },
        })

        return comment
    }

    async fetchMyAccountComments(
        epks: string[],
        sortKey: 'publishedAt' | 'voteSum',
        direction: 'asc' | 'desc',
        db: DB
    ): Promise<Post[]> {
        return db.findMany('Comment', {
            where: {
                epochKey: epks,
            },
            orderBy: {
                [sortKey]: direction,
            },
        })
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
}

export const commentService = new CommentService()
