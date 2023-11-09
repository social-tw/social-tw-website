import { DB } from 'anondb'
import { SnarkProof } from '@unirep/utils'
import { APP_ADDRESS } from '../config'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { Helia } from 'helia'
import { addActionCount } from '../utils/TransactionHelper'
import { ipfsService } from './IpfsService'
import { epochKeyService } from './EpochKeyService'
import { InternalError } from '../types/InternalError'

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
        await this.checkPostExistence(postId, db)

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
        })

        return txnHash
    }

    private async checkPostExistence(postId: string, db: DB) {
        // check post exist
        const post = await db.findOne('Post', {
            where: {
                postId: postId.toString(),
                status: 1,
            },
        })
        if (!post)
            throw new InternalError(
                'Post does not exist, please try later',
                400
            )
    }
}

export const commentService = new CommentService()
