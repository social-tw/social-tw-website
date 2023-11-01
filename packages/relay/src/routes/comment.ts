import { DB } from 'anondb/node'
import { ethers } from 'ethers'
import { Express } from 'express'
import { errorHandler } from '../middleware'
import { UnirepSocialSynchronizer } from '../synchornizer'
import { epochKeyService } from '../services/EpochKeyService'
import type { Helia } from '@helia/interface'
import type { Request, Response } from 'express';

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
                await leaveComment(req, res, db, synchronizer, helia)
            })
        )
}

// TODO do we need to create postservice for below logic?
async function fetchComments(req: Request, res: Response, db:DB) {
    try {
        const { epks, postId } = req.query

        // TODO check condition below
        // FIXME: if epks or postID not exist?
        const comments = await db.findMany('comment', {
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
    helia: Helia,
) {
    try {
        const { content, postId, publicSignals, proof } = req.body
        
        // FIXME add counter

        if (!content) {
            throw new Error('Could not have empty content')
        }
        await checkPostExistence(postId, db);
        
        // TODO further abstract?
        const entryArg = await epochKeyService.callContractAndProve(
            'leaveComment',
            [content],
            publicSignals,
            proof,
            synchronizer
        )
        const comment = await epochKeyService.createEntryDbIpfs(
            'comment',
            entryArg,
            helia,
            db,
        )

        res.json({
            transaction: entryArg['hash'],
            currentEpoch: entryArg['epoch'],
            comment: comment,
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