import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { reportService } from '../services/ReportService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'

import { Groth16Proof, PublicSignals } from 'snarkjs'
import { createCheckReputationMiddleware } from '../middlewares/CheckReputationMiddleware'
import { postService } from '../services/PostService'
import ProofHelper from '../services/utils/ProofHelper'
import Validator from '../services/utils/Validator'
import {
    AdjudicateValue,
    InvalidAdjudicateValueError,
    InvalidProofError,
    InvalidPublicSignalError,
    InvalidReportIdError,
    InvalidReportStatusError,
    NegativeReputationUserError,
} from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/report',
        errorHandler(createCheckReputationMiddleware(synchronizer)),
        errorHandler(async (req: Request, res: Response) => {
            if (res.locals.isNegativeReputation) {
                throw NegativeReputationUserError
            }

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
            // 4. Update post order
            await postService.updateOrder(db)
            res.json({ reportId })
        })
    )

    app.get(
        '/api/report',
        errorHandler(async (req: Request, res: Response) => {
            const { status, publicSignals, proof } = req.query
            if (!Validator.isValidNumber(status)) throw InvalidReportStatusError
            if (!publicSignals) throw InvalidPublicSignalError
            if (!proof) throw InvalidProofError

            await ProofHelper.getAndVerifyEpochKeyLiteProof(
                JSON.parse(publicSignals as string) as PublicSignals,
                JSON.parse(proof as string) as Groth16Proof,
                synchronizer
            )

            const reports = await reportService.fetchReports(
                Number(status),
                synchronizer,
                db
            )
            res.json(reports)
        })
    )

    app.post(
        '/api/report/:id',
        errorHandler(createCheckReputationMiddleware(synchronizer)),
        errorHandler(async (req, res) => {
            if (res.locals.isNegativeReputation) {
                throw NegativeReputationUserError
            }

            const id = req.params.id
            if (!Validator.isValidNumber(id)) {
                throw InvalidReportIdError
            }

            const { adjudicateValue, publicSignals, proof } = req.body

            if (
                !Validator.isValidNumber(adjudicateValue) ||
                !(adjudicateValue in AdjudicateValue)
            ) {
                throw InvalidAdjudicateValueError
            }

            await reportService.voteOnReport(
                id,
                adjudicateValue,
                publicSignals,
                proof,
                synchronizer,
                db
            )

            res.status(201).json({})
        })
    )

    app.get(
        '/api/report/category',
        errorHandler((req, res, next) => {
            const reportCategories = reportService.fetchReportCategory()
            res.json(reportCategories)
        })
    )
}
