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
    app.route('/api/comment')
        .get(
            errorHandler(async (req, res) => {
                await fetchComments(req, res, db)
            })
        )

        .post(
            errorHandler(async (req, res) => {
                await leaveComment(req, res, db, synchronizer)
            })
        )
}

// TODO do we need to create postservice for below logic?
async function fetchComments(req: Request, res: Response, db:DB) {
    try {
        const { epks, postId } = req.query

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
            limit: 10,
        })
        res.json(comments)
    } catch (error: any) {
        res.status(500).json({ error })
    }
}

async function leaveComment(
    req: Request, 
    res: Response,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
) {
    try {
        const { content, publicSignals, postId, proof } = req.body
        if (!content) {
            throw new Error('Could not have empty content')
        }

        const epochKeyProof = await epochKeyService.getAndVerifyProof(
            publicSignals,
            proof,
            synchronizer
        )

        await checkPostExistence(postId, db);

        const appContract = new ethers.Contract(APP_ADDRESS, ABI)
        const calldata = appContract.interface.encodeFunctionData(
            'leaveComment',
            [epochKeyProof.publicSignals, epochKeyProof.proof, content]
        )

        const {cid, hash} = ipfsService.;

        const epoch = epochKeyProof.epoch
        const comment = await db.create('Comment', {
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

async function checkPostExistence(postId: string, db: DB) {
    // check post exist
    const post = await db.findOne('Post', {
        where: {
            _id: postId,
            status: 1,
        },
    })
    if (!post) throw new Error("Post doesn't not exist, please try later")
}