import { DB } from 'anondb'
import { Helia } from 'helia'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { Comment } from '../types/Comment'
import { InternalError } from '../types/InternalError'
import { Post } from '../types/Post'
import { addActionCount } from '../utils/TransactionHelper'
import { epochKeyService } from './EpochKeyService'
import { ipfsService } from './IpfsService'

export class CommentService {
    async fetchComments(
        epks: string | undefined,
        postId: string,
        db: DB
    ): Promise<Comment[]> {
        // TODO check condition below
        // FIXME: if epks or postID not exist?
        const comments = await db.findMany('Comment', {
            where: {
                status: 1,
                postId: postId,
                epochKey: epks,
            },
            orderBy: {
                publishedAt: 'desc',
            },
        })

        return comments
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
        const epochKeyProof = await epochKeyService.getAndVerifyProof(
            publicSignals,
            proof,
            synchronizer
        )

        // store content into helia ipfs node with json plain
        const cid = await ipfsService.createIpfsContent(helia, content)
        const txnHash = await epochKeyService.callContract('leaveComment', [
            publicSignals,
            proof,
            postId,
            content,
        ])

        const epoch = Number(epochKeyProof.epoch)
        const epochKey = epochKeyProof.epochKey.toString()

        // after post data stored in DB, should add 1 to epoch key counter
        await addActionCount(db, epochKey, epoch, (txDB) => {
            txDB.create('Comment', {
                postId: postId,
                content: content,
                cid: cid,
                epochKey: epochKey,
                epoch: epoch,
                transactionHash: txnHash,
                status: 0,
            })
            return 1
        })

        return txnHash
    }

    async deleteComment(
        commentId: string,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer,
        db: DB
    ) {
        const comment: Comment = await db.findOne('Comment', {
            where: {
                status: 1,
                commentId: commentId,
            },
        })
        if (!comment) {
            throw new InternalError('Comment does not exist', 400)
        }

        const epochKeyLiteProof = await epochKeyService.getAndVerifyLiteProof(
            publicSignals,
            proof,
            synchronizer
        )

        const txnHash = await epochKeyService.callContract('editComment', [
            epochKeyLiteProof.publicSignals,
            epochKeyLiteProof.proof,
            comment.postId,
            commentId,
            '',
        ])

        const epoch = Number(epochKeyLiteProof.epoch)
        const epochKey = epochKeyLiteProof.epochKey.toString()

        await addActionCount(db, epochKey, epoch, (_) => {
            return 1
        })

        return txnHash
    }
}

export const commentService = new CommentService()
