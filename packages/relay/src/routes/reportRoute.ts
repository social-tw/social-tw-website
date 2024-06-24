import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { reportService } from '../services/ReportService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
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
                synchronizer
            )
            // 2. Create a report
            const reportId = await reportService.createReport(db, reportData)
            // 3. Adjust Post / Comment Status
            await reportService.updateObjectStatus(db, reportData)
            res.json({ reportId })
        })
    )
}
