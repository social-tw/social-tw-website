import type { Helia } from '@helia/interface'
import { DB } from 'anondb/node'
import { Express } from 'express'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import { EmptyCommentError, InvalidPostIdError } from '../types/InternalError'
import { PostStatus } from '../types/Post'

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
                    PostStatus.OnChain,
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
                    PostStatus.OnChain,
                    db
                )
                if (!post) {
                    throw InvalidPostIdError
                }
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
}
