import { DB } from 'anondb/node'
import { Express } from 'express'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import { voteService } from '../services/VoteService'
import {
    InvalidPostIdError,
    InvalidProofError,
    InvalidPublicSignalError,
    InvalidVoteActionError,
} from '../types/InternalError'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/vote',
        errorHandler(async (req, res, _) => {
            //vote for post with _id
            const { postId, voteAction, publicSignals, proof } = req.body
            if (postId == undefined) throw InvalidPostIdError

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
