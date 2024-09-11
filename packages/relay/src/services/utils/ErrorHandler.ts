import { NextFunction, Request, Response } from 'express'
import { InternalError } from '../../types'

export const errorHandler =
    (func: (req: Request, res: Response, next: NextFunction) => any) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next)
        } catch (error: any) {
            if (error instanceof InternalError) {
                console.log('error', error)
                res.status(error.httpStatusCode).json({
                    error: error.message,
                })
            } else {
                console.error('Uncaught error', error)
                res.status(500).json({
                    message: 'Uncaught error',
                    info: error.message,
                })
            }
        }
    }
