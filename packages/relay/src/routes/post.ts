import { DB } from 'anondb/node'
import { Express } from 'express'
import { errorHandler } from '../middleware'
import { UnirepSocialSynchronizer } from '../synchornizer'

import type { Helia } from '@helia/interface'
import { postService } from '../services/PostService'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
    helia: Helia
) => {
    app.get(
        '/api/post',
        errorHandler(async (req, res, next) => {
            const query = req.query.query?.toString()
            const epks =
                typeof req.query.epks === 'string'
                    ? req.query.epks.split('_')
                    : undefined
            const offset = Number(req.query.offset!)

            const posts = await postService.fetchPosts(query, epks, offset, db)
            res.json(posts)
        })
    )

    app.post(
        '/api/post',
        errorHandler(async (req, res, next) => {
            const { content, publicSignals, proof } = req.body
            if (!content) {
                res.status(400).json({ error: 'Could not have empty content' })
            }

            const hash = await postService.createPost(
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

    app.get(
        '/api/post/:id',
        errorHandler(async (req, res, next) => {
            const id = req.params.id
            if (!id) {
                console.log('id is undefined')
                return res.status(400).json({ error: 'id is undefined' })
            }

            const post = await postService.fetchSinglePost(id, db, undefined)
            if (!post) {
                console.log(`post is not found: ${id}`)
                res.status(404).json({ error: `post is not found: ${id}` })
            } else {
                res.json(post)
            }
        })
    )
}
