import type { Helia } from '@helia/interface'
import { DB } from 'anondb/node'
import { Express } from 'express'
import { createCheckReputationMiddleware } from '../middlewares/CheckReputationMiddleware'
import { postService } from '../services/PostService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import Validator from '../services/utils/Validator'
import { Errors } from '../types'

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
                if (!epks) throw Errors.INVALID_EPOCH_KEY()
                if (!page) throw Errors.INVALID_PAGE()
            }
            if (isNaN(page) || page < 1) throw Errors.INVALID_PAGE()

            const keyword = req.query.q ? (req.query.q as string) : undefined
            const posts = await postService.fetchPosts(epks, page, keyword, db)
            res.json(posts)
        }),
    )

    app.post(
        '/api/post',
        errorHandler(createCheckReputationMiddleware(synchronizer)),
        errorHandler(async (req, res) => {
            if (res.locals.isNegativeReputation)
                throw Errors.NEGATIVE_REPUTATION_USER()

            const { content, publicSignals, proof } = req.body
            if (!content) throw Errors.EMPTY_POST()

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
        '/api/post/postHistory',
        errorHandler(async (req, res) => {
            const fromEpoch = parseInt(req.query.from_epoch as string)
            const toEpoch = parseInt(req.query.to_epoch as string)

            if (isNaN(fromEpoch) || isNaN(toEpoch))
                throw Errors.INVALID_PARAMETERS()

            const history = await postService.getPostHistory(
                fromEpoch,
                toEpoch,
                db,
            )
            res.status(200).json(history)
        }),
    )

    app.get(
        '/api/post/:postId',
        errorHandler(async (req, res, next) => {
            const postId = req.params.postId

            if (!Validator.isValidNumber(postId)) throw Errors.INVALID_POST_ID()

            const post = await postService.fetchSinglePost(postId, db)
            if (!post) {
                throw Errors.POST_NOT_EXIST()
            } else {
                res.json(post)
            }
        }),
    )
}
