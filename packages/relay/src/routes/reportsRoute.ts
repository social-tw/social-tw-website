import { DB } from 'anondb'
import { Express } from 'express'
import { genVHelperIdentifier } from '../../../contracts/test/utils'
import { reportService } from '../services/ReportService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'
import { Errors, ReportStatus } from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
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
                synchronizer,
            )

            const isProofValid = await reportProof.verify()
            if (!isProofValid) throw Errors.INVALID_REPUTATION_PROOF()

            const report = await reportService.fetchSingleReport(reportId, db)
            if (!report) throw Errors.REPORT_NOT_EXIST()
            if (report.status !== ReportStatus.WAITING_FOR_TRANSACTION)
                throw Errors.INVALID_REPORT_STATUS()

            const isPassed = reportService.checkReportResult(report)

            const claimMethod = reportService.getClaimMethod(userType, isPassed)
            const claimChange = reportService.getClaimChange(userType, isPassed)
            const helper = reportService.getClaimHelper(userType)
            const identifier = genVHelperIdentifier(helper)

            const repType = reportService.getReputationType(isPassed, userType)

            await reportService.validateClaimRequest(
                report,
                userType,
                reportProof,
            )

            const txHash = await reportService.claim(
                claimMethod,
                claimChange,
                identifier,
                claimSignals,
                claimProof,
            )

            await reportService.updateReportStatus(
                reportId,
                userType,
                db,
                reportProof,
            )

            await reportService.createReputationHistory(
                db,
                txHash,
                claimChange,
                repType,
                reportId,
                reportProof,
            )

            res.json({
                message: {
                    txHash,
                    reportId,
                    epoch: Number(reportProof.epoch),
                    epochKey: String(reportProof.currentEpochKey),
                    type: repType,
                    score: claimChange,
                    isPassed: isPassed,
                },
            })
        }),
    )
}
