import { Express } from 'express'
import { DB } from 'anondb'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { reportService } from '../services/ReportService'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post('/api/reports/claimPositiveReputation', async (req, res) => {
        try {
            await reportService.claimPositiveReputation(
                req,
                res,
                db,
                synchronizer
            )
        } catch (error) {
            console.error('Error in claimPositiveReputation route:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    app.post('/api/reports/claimNegativeReputation', async (req, res) => {
        try {
            await reportService.claimNegativeReputation(
                req,
                res,
                db,
                synchronizer
            )
        } catch (error) {
            console.error('Error in claimNegativeReputation route:', error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })
}
