import type { Helia } from '@helia/interface'
import { DB } from 'anondb/node'
import { Express } from 'express'
import { checkReputation } from '../middlewares/CheckReputationMiddleware'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import Validator from '../services/utils/Validator'
import {
    EmptyCommentError,
    InternalError,
    InvalidParametersError,
    InvalidPostIdError,
    NegativeReputationUserError,
    PostNotExistError,
} from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
    helia: Helia
) => {
    app.route('/api/comment')
        .get(
            errorHandler(async (req, res) => {
                const { postId } = req.query

                if (!Validator.isValidNumber(postId)) throw InvalidPostIdError

                const post = await postService.fetchSinglePost(
                    postId as string,
                    db
                )

                if (!post) throw PostNotExistError

                const comments = await commentService.fetchComments(
                    postId as string,
                    db
                )

                res.json(comments)
            })
        )

        .post(
            errorHandler(checkReputation),
            errorHandler(async (req, res) => {
                if (!res.locals.isPositiveReputation) {
                    throw NegativeReputationUserError
                }

                const { content, postId, publicSignals, proof } = req.body

                if (!content) throw EmptyCommentError

                if (!Validator.isValidNumber(postId)) throw InvalidPostIdError

                const post = await postService.fetchSinglePost(
                    postId.toString(),
                    db
                )

                if (!post) throw PostNotExistError

                const txHash = await commentService.leaveComment(
                    postId.toString(),
                    content,
                    publicSignals,
                    proof,
                    db,
                    synchronizer,
                    helia
                )
                res.json({ txHash })
            })
        )

        .delete(
            errorHandler(checkReputation),
            errorHandler(async (req, res) => {
                if (!res.locals.isPositiveReputation) {
                    throw NegativeReputationUserError
                }

                const { commentId, postId, publicSignals, proof } = req.body
                const txHash = await commentService.deleteComment(
                    commentId.toString(),
                    postId.toString(),
                    publicSignals,
                    proof,
                    synchronizer,
                    db
                )
                res.json({ txHash })
            })
        )

    app.get(
        '/api/comment/commentHistory',
        errorHandler(async (req, res) => {
            const fromEpoch = parseInt(req.query.from_epoch as string)
            const toEpoch = parseInt(req.query.to_epoch as string)

            if (isNaN(fromEpoch) || isNaN(toEpoch)) throw InvalidParametersError

            const history = await commentService.getCommentHistory(
                fromEpoch,
                toEpoch,
                db
            )
            res.status(200).json(history)
        })
    )
}
