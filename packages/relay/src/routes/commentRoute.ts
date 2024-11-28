import type { Helia } from '@helia/interface'
import { DB } from 'anondb/node'
import { Express } from 'express'
import { createCheckReputationMiddleware } from '../middlewares/CheckReputationMiddleware'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import Validator from '../services/utils/Validator'
import { Errors } from '../types'

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

                if (!Validator.isValidNumber(postId))
                    throw Errors.INVALID_POST_ID()

                const post = await postService.fetchSinglePost(
                    postId as string,
                    db
                )

                if (!post) throw Errors.POST_NOT_EXIST()

                const comments = await commentService.fetchComments(
                    postId as string,
                    db
                )

                res.json(comments)
            })
        )

        .post(
            errorHandler(createCheckReputationMiddleware(synchronizer)),
            errorHandler(async (req, res) => {
                if (res.locals.isNegativeReputation) {
                    throw Errors.NEGATIVE_REPUTATION_USER()
                }

                const { content, postId, publicSignals, proof } = req.body

                if (!content) throw Errors.EMPTY_COMMENT()

                if (!Validator.isValidNumber(postId))
                    throw Errors.INVALID_POST_ID()

                const post = await postService.fetchSinglePost(
                    postId.toString(),
                    db
                )

                if (!post) throw Errors.POST_NOT_EXIST()

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
            errorHandler(createCheckReputationMiddleware(synchronizer)),
            errorHandler(async (req, res) => {
                if (res.locals.isNegativeReputation) {
                    throw Errors.NEGATIVE_REPUTATION_USER()
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

            if (isNaN(fromEpoch) || isNaN(toEpoch))
                throw Errors.INVALID_PARAMETERS()

            const history = await commentService.getCommentHistory(
                fromEpoch,
                toEpoch,
                db
            )
            res.status(200).json(history)
        })
    )
}
