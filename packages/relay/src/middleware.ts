import { NextFunction, Request, Response } from 'express'
import { VoteError } from './error/voteError'

export const errorHandler =
    (func: (req: Request, res: Response, next: NextFunction) => any) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next)
        } catch (err: any) {
            console.log('Uncaught error', err)
            res.status(500).json({
                message: 'Uncaught error',
                info: err.toString(),
            })
        }
    }

export function voteErrorHandler(err: VoteError, res: any) {
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'

    res.status(status).json({ error: message })
}
