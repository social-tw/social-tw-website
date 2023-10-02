import { DB } from 'anondb/node'
import { ethers } from 'ethers'
import { Express } from 'express'
import UNIREP_APP from '@unirep-app/contracts/artifacts/contracts/UnirepApp.sol/UnirepApp.json'
import { EpochKeyProof } from '@unirep/circuits'
import { APP_ADDRESS } from '../config'
import { errorHandler } from '../middleware'
import TransactionManager from '../singletons/TransactionManager'
import { UnirepSocialSynchronizer } from '../synchornizer'


export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
) => {
    app.post(
        '/api/vote',
        errorHandler(async (req, res, next) => {
            await Vote(req, res, db, synchronizer)
        })
    )
}

async function Vote(
    req,
    res,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) {
    try {
        //vote for post with _id
        //vote is 1 for upvote, 0 for downvote
        const { _id, vote, publicSignals, proof } = req.body

        // verify epochKeyProof of user
        const epochKeyProof = new EpochKeyProof(
            publicSignals,
            proof,
            synchronizer.prover
        )

        const valid = await epochKeyProof.verify()
        if (!valid) {
            res.status(400).json({ error: 'Invalid proof' })
            return
        }

        //find post which is voted
        const findPost = await db.findOne('Post', {
            where: {
                _id: _id,
            },
        })

        //find vote record of users in specific post
        const findVote = await db.findOne('Vote', {
            where: {
                postId: _id,
                epochKey: epochKeyProof.epochKey.toString()
            },
        })    
        
        //check whether if user voted
        if(findVote) {
            if(vote == 0 && findVote.downVote == true){
                res.status(400).json({ error: 'user voted' })
                return
            }
            else if(vote == 1 && findVote.upVote == true){
                res.status(400).json({ error: 'user voted' })
                return
            }
        }

        //check upCount or downCount
        let count = 0
        let voteCount = "upCount"
        let voteMethod = "upVote"
        if(vote == 0){
            count = findPost.downCount + 1
            voteCount = "downCount"
            voteMethod = "downVote"
        }
        else if (vote == 1) count = findPost.upCount + 1
        else {
            res.status(400).json({ error: 'Invalid vote method' })
            return
        }

        //update post info in database
        const post = await db.update('Post', {
            where: {
                _id: findPost._id,
            },
            update: {
                [voteCount]: count
            }
        })

        //update user vote record
        await db.upsert('Vote', {
            where: {
                postId: _id,
                epochKey: epochKeyProof.epochKey.toString()
            },
            create: {
                postId: _id,
                epochKey: epochKeyProof.epochKey.toString(),
                [voteMethod]: true
            },
            update: {
                [voteMethod]: true
            },
        })

        res.json({
            post,
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error })
    }
}
