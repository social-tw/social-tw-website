import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { errorHandler } from '../services/singletons/errorHandler'
import { commentService } from '../services/CommentService'
import { UnspecifiedEpochKeyError, InvalidSortKeyError, InvalidDirectionError } from '../types/InternalError'
import { postService } from '../services/PostService'
import { voteService } from '../services/VoteService'

export default (app: Express, db: DB) => {
    const handleMyAccountRequest = async (
        req: Request,
        res: Response,
        fetchData: (
            epks: string[],
            sortKey: 'publishedAt' | 'voteSum',
            direction: 'asc' | 'desc',
            db: DB
        ) => Promise<any[]>
    ) => {
        const epks = req.query.epks as string | undefined
        const parsedEpks = epks?.split('_') || []
        if (parsedEpks.length === 0) { throw UnspecifiedEpochKeyError }

        const sortKey = (req.query.sortKey as string) ?? 'publishedAt'
        if (sortKey !== 'publishedAt' && sortKey !== 'voteSum') {
            throw InvalidSortKeyError
        }

        const direction = (req.query.direction as string) ?? 'desc'
        if (direction !== 'asc' && direction !== 'desc') {
            throw InvalidDirectionError
        }

        const data = await fetchData(parsedEpks, sortKey, direction, db)
        res.json(data)
    }

    app.get(
        '/api/my-account/posts',
        errorHandler(async (req, res) => {
            return await handleMyAccountRequest(
                req,
                res,
                postService.fetchMyAccountPosts
            )
        })
    )

    app.get(
        '/api/my-account/comments',
        errorHandler(async (req, res) => {
            return await handleMyAccountRequest(
                req,
                res,
                commentService.fetchMyAccountComments
            )
        })
    )

    app.get(
        '/api/my-account/votes',
        errorHandler(async (req, res) => {
            return await handleMyAccountRequest(
                req,
                res,
                voteService.fetchMyAccountVotes
            )
        })
    )
}
