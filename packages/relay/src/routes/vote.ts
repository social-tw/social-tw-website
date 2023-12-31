import { DB } from 'anondb/node'
import { Express } from 'express'
import { errorHandler } from '../services/singletons/errorHandler'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { voteService } from '../services/VoteService'
import { InternalError } from '../types/InternalError'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/vote',
        errorHandler(async (req, res, _) => {
            //vote for post with _id
            const { _id, voteAction, publicSignals, proof } = req.body
            if (
                _id == undefined ||
                voteAction == undefined ||
                publicSignals == undefined ||
                proof == undefined
            ) {
                throw new InternalError(
                    'postId, voteAction, publicSignals, proof should not be null',
                    400
                )
            }

            await voteService.vote(
                _id,
                voteAction,
                publicSignals,
                proof,
                db,
                synchronizer
            )
            res.status(201).json({})
        })
    )
}
