import { DB } from 'anondb/node'
import { Express } from 'express'
import { voteService } from '../services/VoteService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import Validator from '../services/utils/Validator'
import { Errors } from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/vote',
        errorHandler(async (req, res) => {
            //vote for post with _id
            const { postId, voteAction, publicSignals, proof } = req.body
            if (!Validator.isValidNumber(postId)) throw Errors.INVALID_POST_ID()

            if (voteAction == undefined) throw Errors.INVALID_VOTE_ACTION()

            if (publicSignals == undefined) throw Errors.INVALID_PUBLIC_SIGNAL()

            if (proof == undefined) throw Errors.INVALID_PROOF()

            await voteService.vote(
                postId,
                voteAction,
                publicSignals,
                proof,
                db,
                synchronizer
            )
            res.status(201).json({})
        })
    )

    app.get(
        '/api/vote/voteHistory',
        errorHandler(async (req, res) => {
            const fromEpoch = parseInt(req.query.from_epoch as string)
            const toEpoch = parseInt(req.query.to_epoch as string)

            if (isNaN(fromEpoch) || isNaN(toEpoch))
                throw Errors.INVALID_PARAMETERS()

            const history = await voteService.getVoteHistory(
                fromEpoch,
                toEpoch,
                db
            )
            res.status(200).json(history)
        })
    )
}
