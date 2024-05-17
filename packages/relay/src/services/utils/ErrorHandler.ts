import { NextFunction, Request, Response } from 'express'
import { InternalError } from '../../types/InternalError'

export const errorHandler =
    (func: (req: Request, res: Response, next: NextFunction) => any) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next)
        } catch (err: any) {
            if (err instanceof InternalError) {
                console.log('error', err)
                res.status(err.httpStatusCode).json({
                    error: err.message,
                })
            } else {
                console.error('Uncaught error', err)
                res.status(500).json({
                    message: 'Uncaught error',
                    info: err.message,
                })
            }
        }
    }
