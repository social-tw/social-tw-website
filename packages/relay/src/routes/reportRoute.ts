import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { errorHandler } from '../services/utils/ErrorHandler'
import { reportService } from '../services/ReportService'
import { ReportHistory } from '../types/Report'

export default (app: Express, db: DB) => {
    app.post(
        '/api/report',
        errorHandler(async (req: Request, res: Response) => {
            // Validate request body
            // Create a report
            const reportData = req.body as ReportHistory
            const reportId = await reportService.createReport(db, reportData)
            // Adjust Post / Comment Status
            res.json({ reportId })
        })
    )
}
