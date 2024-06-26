import type { Helia } from '@helia/interface'
import { DB } from 'anondb/node'
import { Express } from 'express'
import { postService } from '../services/PostService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import Validator from '../services/utils/Validator'
import {
    EmptyPostError,
    InvalidEpochKeyError,
    InvalidPageError,
    InvalidPostIdError,
    PostNotExistError,
} from '../types/InternalError'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
    helia: Helia,
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
            if (isNaN(page) || page < 1) throw InvalidPageError

            const posts = await postService.fetchPosts(epks, page, db)
            res.json(posts)
        }),
    )

    app.post(
        '/api/post',
        errorHandler(async (req, res, next) => {
            const { content, publicSignals, proof } = req.body
            if (!content) throw EmptyPostError

            const txHash = await postService.createPost(
                content,
                publicSignals,
                proof,
                db,
                synchronizer,
                helia,
            )

            res.json({ txHash })
        }),
    )

    app.get(
        '/api/post/:postId',
        errorHandler(async (req, res, next) => {
            const postId = req.params.postId

            if (!Validator.isValidNumber(postId)) throw InvalidPostIdError

            const post = await postService.fetchSinglePost(postId, db)
            if (!post) {
                throw PostNotExistError
            } else {
                res.json(post)
            }
        }),
    )
}
