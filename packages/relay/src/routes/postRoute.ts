import { DB } from 'anondb/node'
import { Express } from 'express'
import { errorHandler } from '../services/singletons/ErrorHandler'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'

import type { Helia } from '@helia/interface'
import { postService } from '../services/PostService'
import {
    InvalidPostIdError,
    EmptyPostError,
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
                throw InvalidPageError
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
                throw EmptyPostError
            }

            const txHash = await postService.createPost(
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

    app.get(
        '/api/post/:id',
        errorHandler(async (req, res, next) => {
            const id = req.params.id
            if (!id) {
                throw InvalidPostIdError
            }

            const post = await postService.fetchSinglePost(id, db)
            if (!post) {
                throw InvalidPostIdError
            } else {
                res.json(post)
            }
        })
    )
}
