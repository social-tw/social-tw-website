import { DB } from 'anondb/node'
import { Express } from 'express'
import { errorHandler } from '../middleware'
import { UnirepSocialSynchronizer } from '../synchornizer'
import type { Helia } from '@helia/interface'
import { commentService } from '../services/CommentService'
import { InternalError } from '../types/InternalError'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
    helia: Helia
) => {
    app.route('/api/comment')
        .get(
            errorHandler(async (req, res) => {
                const { epks, postId } = req.query
                if (!postId) {
                    throw new InternalError('postId is undefined', 400)
                }

                const comments = await commentService.fetchComments(
                    epks?.toString(),
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
                    throw new InternalError('Could not have empty content', 400)
                }
                const hash = await commentService.leaveComment(
                    postId,
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
}
