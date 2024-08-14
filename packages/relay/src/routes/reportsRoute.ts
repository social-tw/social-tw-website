import { Express } from 'express'
import { DB } from 'anondb'
import { reportService } from '../services/ReportService'
import { errorHandler } from '../services/utils/ErrorHandler'

export default (app: Express, db: DB) => {
    app.post(
        '/api/reports/claimPositiveReputation',
        errorHandler(async (req, res) => {
            await reportService.claimPositiveReputation(req, res, db)
        })
    )

    app.post(
        '/api/reports/claimNegativeReputation',
        errorHandler(async (req, res) => {
            await reportService.claimNegativeReputation(req, res, db)
        })
    )
}
