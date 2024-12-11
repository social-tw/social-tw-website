import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { reportService } from '../services/ReportService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'

import { Groth16Proof, PublicSignals } from 'snarkjs'
import { createCheckReputationMiddleware } from '../middlewares/CheckReputationMiddleware'
import ProofHelper from '../services/utils/ProofHelper'
import Validator from '../services/utils/Validator'
import { AdjudicateValue, Errors } from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer,
) => {
    app.post(
        '/api/report',
        errorHandler(createCheckReputationMiddleware(synchronizer)),
        errorHandler(async (req: Request, res: Response) => {
            if (res.locals.isNegativeReputation)
                throw Errors.NEGATIVE_REPUTATION_USER()

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
        errorHandler(async (req: Request, res: Response) => {
            const { status, publicSignals, proof } = req.query
            if (!Validator.isValidNumber(status))
                throw Errors.INVALID_REPORT_STATUS()
            if (!publicSignals) throw Errors.INVALID_PUBLIC_SIGNAL()
            if (!proof) throw Errors.INVALID_PROOF()

            await ProofHelper.getAndVerifyEpochKeyLiteProof(
                JSON.parse(publicSignals as string) as PublicSignals,
                JSON.parse(proof as string) as Groth16Proof,
                synchronizer,
            )

            const reports = await reportService.fetchReports(
                Number(status),
                synchronizer,
                db,
            )
            res.json(reports)
        }),
    )

    app.post(
        '/api/report/:id',
        errorHandler(createCheckReputationMiddleware(synchronizer)),
        errorHandler(async (req, res) => {
            if (res.locals.isNegativeReputation)
                throw Errors.NEGATIVE_REPUTATION_USER()

            const id = req.params.id
            if (!Validator.isValidNumber(id)) throw Errors.INVALID_REPORT_ID()

            const { adjudicateValue, publicSignals, proof } = req.body

            if (
                !Validator.isValidNumber(adjudicateValue) ||
                !(adjudicateValue in AdjudicateValue)
            ) {
                throw Errors.INVALID_ADJUDICATE_VALUE()
            }

            await reportService.voteOnReport(
                id,
                adjudicateValue,
                publicSignals,
                proof,
                synchronizer,
                db,
            )

            res.status(201).json({})
        }),
    )

    app.get(
        '/api/report/category',
        errorHandler((req, res, next) => {
            const reportCategories = reportService.fetchReportCategory()
            res.json(reportCategories)
        }),
    )
}
