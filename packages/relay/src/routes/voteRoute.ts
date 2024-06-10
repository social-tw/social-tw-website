import { DB } from 'anondb/node'
import { Express } from 'express'
import { errorHandler } from '../services/utils/ErrorHandler'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { voteService } from '../services/VoteService'
import {
    InvalidPostIdError,
    InvalidVoteActionError,
    InvalidPublicSignalError,
    InvalidProofError,
    InvalidParametersError,
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
            const { postId, voteAction, publicSignals, proof, onCancel } =
                req.body
            if (postId == undefined) {
                throw InvalidPostIdError
            }
            if (voteAction == undefined) {
                throw InvalidVoteActionError
            }
            if (publicSignals == undefined) {
                throw InvalidPublicSignalError
            }
            if (proof == undefined) {
                throw InvalidProofError
            }
            if (onCancel == undefined) {
                throw InvalidParametersError
            }

            await voteService.vote(
                postId,
                voteAction,
                publicSignals,
                proof,
                onCancel,
                db,
                synchronizer
            )
            res.status(201).json({})
        })
    )
}
