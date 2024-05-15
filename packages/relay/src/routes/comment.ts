import { DB } from 'anondb/node'
import { Express } from 'express'
import { errorHandler } from '../services/singletons/errorHandler'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import type { Helia } from '@helia/interface'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import { InvalidPostIdError, EmptyCommentError } from '../types/InternalError'

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
                if (!postId) {
                    throw InvalidPostIdError
                }

                const post = await postService.fetchSinglePost(
                    postId.toString(),
                    db
                )
                if (!post) {
                    throw InvalidPostIdError
                }

                const comments = await commentService.fetchComments(
                    postId.toString(),
                    db
                )
                res.json(comments)
            })
        )

        .post(
            errorHandler(async (req, res) => {
                const { content, postId, publicSignals, proof } = req.body
                if (!content) {
                    throw EmptyCommentError
                }

                const post = await postService.fetchSinglePost(
                    postId.toString(),
                    db
                )
                if (!post) {
                    throw InvalidPostIdError
                }
                const hash = await commentService.leaveComment(
                    postId.toString(),
                    content,
                    publicSignals,
                    proof,
                    db,
                    synchronizer,
                    helia
                )
                res.json({ transaction: hash })
            })
        )

        .delete(
            errorHandler(async (req, res) => {
                const { commentId, postId, publicSignals, proof } = req.body
                const hash = await commentService.deleteComment(
                    commentId.toString(),
                    postId.toString(),
                    publicSignals,
                    proof,
                    synchronizer,
                    db
                )
                res.json({ transaction: hash })
            })
        )
}
