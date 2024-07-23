import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import { voteService } from '../services/VoteService'
import { errorHandler } from '../services/utils/ErrorHandler'
import {
    InvalidDirectionError,
    InvalidSortKeyError,
    NoDataFoundError,
    UnspecifiedEpochKeyError,
} from '../types'

export default (app: Express, db: DB) => {
    const handleMyAccountRequest = async (
        req: Request,
        res: Response,
        fetchData: (
            epks: string[],
            sortKey: 'publishedAt' | 'voteSum',
            direction: 'asc' | 'desc',
            db: DB
        ) => Promise<any[] | null>
    ) => {
        const epks = req.query.epks as string | undefined
        const parsedEpks = epks?.split('_') || []
        if (parsedEpks.length === 0) {
            throw UnspecifiedEpochKeyError
        }

        const sortKey = (req.query.sortKey as string) ?? 'publishedAt'
        if (sortKey !== 'publishedAt' && sortKey !== 'voteSum') {
            throw InvalidSortKeyError
        }

        const direction = (req.query.direction as string) ?? 'desc'
        if (direction !== 'asc' && direction !== 'desc') {
            throw InvalidDirectionError
        }

        const data = await fetchData(parsedEpks, sortKey, direction, db)
        if (data === null) throw NoDataFoundError
        res.json(data)
    }

    app.get(
        '/api/my-account/posts',
        errorHandler(async (req, res) => {
            return await handleMyAccountRequest(
                req,
                res,
                (epks, sortKey, direction, db) =>
                    postService.fetchMyAccountPosts(
                        epks,
                        sortKey,
                        direction,
                        db
                    )
            )
        })
    )

    app.get(
        '/api/my-account/comments',
        errorHandler(async (req, res) => {
            return await handleMyAccountRequest(
                req,
                res,
                (epks, sortKey, direction, db) =>
                    commentService.fetchMyAccountComments(
                        epks,
                        sortKey,
                        direction,
                        db
                    )
            )
        })
    )

    app.get(
        '/api/my-account/votes',
        errorHandler(async (req, res) => {
            return await handleMyAccountRequest(
                req,
                res,
                (epks, sortKey, direction, db) =>
                    voteService.fetchMyAccountVotes(
                        epks,
                        sortKey,
                        direction,
                        db
                    )
            )
        })
    )
}
