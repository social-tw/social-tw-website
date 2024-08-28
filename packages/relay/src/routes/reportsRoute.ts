import { Express } from 'express'
import { DB } from 'anondb'
import { reportService } from '../services/ReportService'
import { errorHandler } from '../services/utils/ErrorHandler'
import {
    InvalidReportStatusError,
    ReportNotExistError,
    ReportStatus,
} from '../types'
import { ReputationDirection } from '../types/Reputation'
import { genVHelperIdentifier } from '../../../contracts/test/utils'

export default (app: Express, db: DB) => {
    app.post(
        '/api/reputation/claim',
        errorHandler(async (req, res) => {
            const { reportId, repUserType, claimSignals, claimProof } = req.body
            const report = await reportService.fetchSingleReport(reportId, db)
            if (!report) throw ReportNotExistError
            if (report.status !== ReportStatus.WAITING_FOR_TRANSACTION)
                throw InvalidReportStatusError

            const isPassed = reportService.checkReportResult(report)

            const claimMethod = reportService.getClaimMethod(
                repUserType,
                isPassed
            )
            const claimChange = reportService.getClaimChange(
                repUserType,
                isPassed
            )
            const helper = reportService.getClaimHelper(repUserType)
            const identifier = genVHelperIdentifier(helper)

            const direction = isPassed
                ? ReputationDirection.POSITIVE
                : ReputationDirection.NEGATIVE
            const repType = reportService.getReputationType(
                isPassed,
                repUserType
            )

            await reportService.validateClaimRequest(
                report,
                repUserType,
                direction,
                claimSignals[2]
            )

            const txHash = await reportService.claim(
                claimMethod,
                claimChange,
                identifier,
                claimSignals,
                claimProof
            )

            await reportService.updateReportStatus(
                reportId,
                repUserType,
                db,
                claimSignals[2]
            )

            await reportService.createReputationHistory(
                db,
                txHash,
                claimChange,
                repType,
                reportId,
                report
            )

            res.json({
                message: {
                    txHash,
                    reportId,
                    epoch: report.reportEpoch,
                    epochKey: report.respondentEpochKey,
                    type: repType,
                    score: claimChange,
                },
            })
        })
    )
}
