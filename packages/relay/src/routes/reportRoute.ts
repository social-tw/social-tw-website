import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { reportService } from '../services/ReportService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'

import { ReportStatus } from '../types'
import { InvalidReportStatusError } from '../types/InternalError'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
) => {
    app.post(
        '/api/report',
        errorHandler(async (req: Request, res: Response) => {
            const { _reportData, publicSignals, proof } = req.body
            // 1. Validate request body
            const reportData = await reportService.verifyReportData(
                db,
                _reportData,
                publicSignals,
                proof,
                synchronizer,
            )
            // 2. Create a report
            const reportId = await reportService.createReport(db, reportData)
            // 3. Adjust Post / Comment Status
            await reportService.updateObjectStatus(db, reportData)
            res.json({ reportId })
        }),
    )
    
    app.get(
        '/api/report',
        errorHandler( async (req: Request, res: Response) => {
            const { status } = req.query
            if (!status) {
                throw InvalidReportStatusError
            }

            const reports = await reportService.fetchReport(
                ReportStatus[status.toString()],
                synchronizer,
                db
            )
            res.json(reports)
        })
    )
}
