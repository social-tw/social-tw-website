import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { errorHandler } from '../services/utils/ErrorHandler'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import { reportService } from '../services/ReportService'
import { ReportHistory, ReportType } from '../types/Report'
import {
    InvalidPostIdError,
    CommentNotExistError,
} from '../types/InternalError'

export default (app: Express, db: DB) => {
    app.post(
        '/api/report/create',
        errorHandler(async (req: Request, res: Response) => {
            const reportData = req.body as ReportHistory
            // 1. Validate request body
            // 1.a Check if the post / comment exists is not reported already(post status = 1 / comment status = 1)
            if (reportData.type === ReportType.Post) {
                const post = await postService.fetchSinglePost(
                    reportData.objectId.toString(),
                    db
                )
                if (!post) throw InvalidPostIdError
            } else if (reportData.type === ReportType.Comment) {
                const comment = await commentService.fetchSingleComment(
                    reportData.objectId.toString(),
                    db
                )
                if (!comment) throw CommentNotExistError
            }
            // 1.b Check if the epoch key is valid

            // 2. Create a report
            const reportId = await reportService.createReport(db, reportData)
            // 3. Adjust Post / Comment Status
            res.json({ reportId })
        })
    )
}
