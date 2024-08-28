import { Express } from 'express'
import { DB } from 'anondb'
import { reportService } from '../services/ReportService'
import { errorHandler } from '../services/utils/ErrorHandler'
import {
    InvalidReportStatusError,
    InvalidReputationProofError,
    ReportNotExistError,
    ReportStatus,
} from '../types'
import { genVHelperIdentifier } from '../../../contracts/test/utils'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/reputation/claim',
        errorHandler(async (req, res) => {
            const { reportId, repUserType, claimSignals, claimProof } = req.body
            const userType = Number(repUserType)
            const reportProof = await reportService.getReportProof(
                claimSignals,
                claimProof,
                userType,
                synchronizer
            )

            const isProofValid = await reportProof.verify()
            if (!isProofValid) {
                throw InvalidReputationProofError
            }

            const report = await reportService.fetchSingleReport(reportId, db)
            if (!report) throw ReportNotExistError
            if (report.status !== ReportStatus.WAITING_FOR_TRANSACTION)
                throw InvalidReportStatusError

            const isPassed = reportService.checkReportResult(report)

            const claimMethod = reportService.getClaimMethod(userType, isPassed)
            const claimChange = reportService.getClaimChange(userType, isPassed)
            const helper = reportService.getClaimHelper(userType)
            const identifier = genVHelperIdentifier(helper)

            const repType = reportService.getReputationType(isPassed, userType)

            await reportService.validateClaimRequest(
                report,
                userType,
                reportProof
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
                userType,
                db,
                reportProof
            )

            await reportService.createReputationHistory(
                db,
                txHash,
                claimChange,
                repType,
                reportId,
                reportProof
            )

            res.json({
                message: {
                    txHash,
                    reportId,
                    epoch: Number(reportProof.epoch),
                    epochKey: String(reportProof.currentEpochKey),
                    type: repType,
                    score: claimChange,
                },
            })
        })
    )
}
