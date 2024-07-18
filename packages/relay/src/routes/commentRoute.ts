import type { Helia } from '@helia/interface'
import { DB } from 'anondb/node'
import { Express } from 'express'
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
            errorHandler(async (req, res) => {
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
            errorHandler(async (req, res) => {
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

    app.get('/api/comment/commentHistory', async (req, res) => {
        try {
            const fromEpoch = parseInt(req.query.from_epoch as string)
            const toEpoch = parseInt(req.query.to_epoch as string)

            if (isNaN(fromEpoch) || isNaN(toEpoch)) {
                return res
                    .status(400)
                    .json({ error: 'Invalid epoch parameters' })
            }

            const history = await commentService.getCommentHistory(
                fromEpoch,
                toEpoch,
                db
            )
            res.status(200).json(history)
        } catch (error) {
            if (error instanceof InternalError) {
                res.status(error.httpStatusCode).json({ error: error.message })
            } else {
                res.status(500).json({ error: 'Internal server error' })
            }
        }
    })
}
