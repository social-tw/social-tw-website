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
        
        //check upCount or downCount
        let count = 0
        let voteMethod = "upCount"
        if(vote == 0){
            count = findPost.downCount + 1
            voteMethod = "downCount"
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
                [voteMethod]: count
            }
        })
        res.json({
            post,
        })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ error })
    }
}
