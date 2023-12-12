import { DB } from 'anondb'
import { SnarkProof } from '@unirep/utils'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { Helia } from 'helia'
import { addActionCount } from '../utils/TransactionHelper'
import { ipfsService } from './IpfsService'
import { epochKeyService } from './EpochKeyService'
import { InternalError } from '../types/InternalError'
import { Comment } from '../types/Comment'

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

    async leaveComment(
        postId: string,
        content: string,
        publicSignals: (bigint | string)[],
        proof: SnarkProof,
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
        publicSignals: (bigint | string)[],
        proof: SnarkProof,
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
