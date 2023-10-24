import { DB } from 'anondb/node'
import { ethers } from 'ethers'
import { Express } from 'express'
import ABI from '@unirep-app/contracts/abi/UnirepApp.json'
import { APP_ADDRESS, LOAD_POST_COUNT } from '../config'
import { errorHandler } from '../middleware'
import TransactionManager from '../singletons/TransactionManager'
import { UnirepSocialSynchronizer } from '../synchornizer'
import type { Helia } from '@helia/interface'
import type { Request, Response } from 'express';
import { epochKeyService } from '../services/EpochKeyService'
import { ipfsService } from '../services/IpfsService'


export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
    helia: Helia
) => {
    const commentController = new CommentController(db, synchronizer, helia);

    app.route('/api/comment')
        .get(
            errorHandler(async (req, res) => {
                await commentController.fetchComments(req, res)
            })
        )

        .post(
            errorHandler(async (req, res) => {
                await commentController.leaveComment(req, res)
            })
        )
}

class CommentController {
    private db: DB;
    private synchronizer: UnirepSocialSynchronizer;
    private helia: Helia;

    constructor(
        db: DB,
        synchronizer: UnirepSocialSynchronizer,
        helia: Helia
    ){
        this.db = db;
        this.synchronizer = synchronizer;
        this.helia = helia;
    }

    // TODO do we need to create postservice for below logic?
    public async fetchComments(req: Request, res: Response) {
        try {
            const { epks, postId } = req.query

            // TODO check condition below
            // FIXME: if epks or postID not exist?
            const comments = await this.db.findMany('Comment', {
                where: {
                    status: 1,
                    postId: postId,
                    epochKey: epks,
                },
                orderBy: {
                    publishedAt: 'desc',
                },
                limit: 10,
            })
            res.json(comments)
        } catch (error: any) {
            res.status(500).json({ error })
        }
    }

    public async leaveComment(req: Request, res: Response) {
        try {
            const { content, publicSignals, postId, proof } = req.body
            if (!content) {
                throw new Error('Could not have empty content')
            }

            const epochKeyProof = await epochKeyService.getAndVerifyProof(
                publicSignals,
                proof,
                this.synchronizer
            )

            await this.checkPostExistence(postId);

            const appContract = new ethers.Contract(APP_ADDRESS, ABI)
            const calldata = appContract.interface.encodeFunctionData(
                'leaveComment',
                [epochKeyProof.publicSignals, epochKeyProof.proof, content]
            )

            const {cid, hash} = ipfsService.;

            const epoch = epochKeyProof.epoch
            const comment = await this.db.create('Comment', {
                content: content,
                cid: cid,
                epochKey: epochKeyProof.epochKey.toString(),
                epoch: epoch,
                transactionHash: hash,
                status: 0,
            })

            res.json({
                transaction: hash,
                currentEpoch: epoch,
                post: comment,
            })
        } catch (error: any) {
            console.error(error)
            res.status(500).json({ error })
        }
    }

    private async checkPostExistence(postId: string) {
        // check post exist
        const post = await this.db.findOne('Post', {
            where: {
                _id: postId,
                status: 1,
            },
        })
        if (!post) throw new Error("Post doesn't not exist, please try later")
    }
}