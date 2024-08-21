import { Express } from 'express'
import { DB } from 'anondb'
import { reportService } from '../services/ReportService'
import { errorHandler } from '../services/utils/ErrorHandler'

export default (app: Express, db: DB) => {
    app.post(
        '/api/reputation/claim/positive',
        errorHandler(async (req, res) => {
            await reportService.claimPositiveReputation(req, res, db)
        })
    )

    app.post(
        '/api/reputation/claim/negative',
        errorHandler(async (req, res) => {
            await reportService.claimNegativeReputation(req, res, db)
        })
    )
}
