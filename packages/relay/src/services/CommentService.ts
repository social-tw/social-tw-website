import { DB } from 'anondb'
import { SnarkProof } from '@unirep/utils'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { Helia } from 'helia'
import { addActionCount } from '../utils/TransactionHelper'
import { ipfsService } from './IpfsService'
import { epochKeyService } from './EpochKeyService'
import { InternalError } from '../types/InternalError'
import { Comment } from '../types/Comment'
import { Post } from '../types/Post'

export class CommentService {
    async fetchComments(postId: string, db: DB): Promise<Comment[]> {
        // TODO check condition below
        // FIXME: if epks or postID not exist?
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
        transactionHash: string,
        publicSignals: (bigint | string)[],
        proof: SnarkProof,
        synchronizer: UnirepSocialSynchronizer,
        db: DB
    ) {
        const comment: Comment = await db.findOne('Comment', {
            where: {
                transactionHash,
            },
        })
        if (!comment) {
            throw new InternalError('Comment does not exist', 400)
        }

        if (!comment.commentId) {
            console.log(
                'comment does not have commentId, update deleted status only '
            )
            await db.update('Comment', {
                where: {
                    transactionHash,
                },
                update: {
                    status: 2,
                },
            })
            return
        }

        const epochKeyLiteProof = await epochKeyService.getAndVerifyLiteProof(
            publicSignals,
            proof,
            synchronizer,
            comment.epochKey
        )

        const txnHash = await epochKeyService.callContract('editComment', [
            epochKeyLiteProof.publicSignals,
            epochKeyLiteProof.proof,
            comment.postId,
            comment.commentId,
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
