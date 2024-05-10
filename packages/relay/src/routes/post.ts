import { DB } from 'anondb/node'
import { Express } from 'express'
import { errorHandler } from '../services/singletons/errorHandler'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'

import type { Helia } from '@helia/interface'
import { postService } from '../services/PostService'
import {
    InternalError,
    InvalidEpochKeyError,
    InvalidPageError,
} from '../types/InternalError'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
    helia: Helia
) => {
    app.get(
        '/api/post',
        errorHandler(async (req, res, next) => {
            const epks =
                typeof req.query.epks === 'string'
                    ? req.query.epks.split('_')
                    : undefined
            const page = req.query.page ? Number(req.query.page) : 1
            if (!epks && !page) {
                if (!epks) throw InvalidEpochKeyError
                if (!page) throw InvalidPageError
            }
            if (isNaN(page) || page < 1) {
                throw new InternalError('Invalid page number', 400)
            }

            const posts = await postService.fetchPosts(epks, page, db)
            res.json(posts)
        })
    )

    app.post(
        '/api/post',
        errorHandler(async (req, res, next) => {
            const { content, publicSignals, proof } = req.body
            if (!content) {
                throw new InternalError('Could not have empty content', 400)
            }

            const { txHash, postId } = await postService.createPost(
                content,
                publicSignals,
                proof,
                db,
                synchronizer,
                helia
            )

            res.json({ transaction: txHash, postId })
        })
    )

    app.get(
        '/api/post/:id',
        errorHandler(async (req, res, next) => {
            const id = req.params.id
            if (!id) {
                throw new InternalError('id is undefined', 400)
            }

            const post = await postService.fetchSinglePost(id, db, undefined)
            if (!post) {
                throw new InternalError(`post is not found: ${id}`, 400)
            } else {
                res.json(post)
            }
        })
    )
}
