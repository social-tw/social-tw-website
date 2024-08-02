import { DB } from 'anondb/node'
import { Express } from 'express'
import { createCheckReputationMiddleware } from '../middlewares/CheckReputationMiddleware'
import { voteService } from '../services/VoteService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import Validator from '../services/utils/Validator'
import {
    InvalidPostIdError,
    InvalidProofError,
    InvalidPublicSignalError,
    InvalidVoteActionError,
    NegativeReputationUserError,
} from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/vote',
        errorHandler(createCheckReputationMiddleware(synchronizer)),
        errorHandler(async (req, res) => {
            if (res.locals.isNegativeReputation) {
                throw NegativeReputationUserError
            }

            //vote for post with _id
            const { postId, voteAction, publicSignals, proof } = req.body
            if (!Validator.isValidNumber(postId)) throw InvalidPostIdError

            if (voteAction == undefined) throw InvalidVoteActionError

            if (publicSignals == undefined) throw InvalidPublicSignalError

            if (proof == undefined) throw InvalidProofError

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
}
