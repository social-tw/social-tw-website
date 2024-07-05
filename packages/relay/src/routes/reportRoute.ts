import { DB } from 'anondb/node'
import { Express, Request, Response } from 'express'
import { reportService } from '../services/ReportService'
import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import { errorHandler } from '../services/utils/ErrorHandler'

import { Groth16Proof, PublicSignals } from 'snarkjs'
import { checkReputation } from '../middlewares/CheckReputationMiddleware'
import ProofHelper from '../services/utils/ProofHelper'
import Validator from '../services/utils/Validator'
import {
    AdjudicateValue,
    InvalidAdjudicateValueError,
    InvalidProofError,
    InvalidPublicSignalError,
    InvalidReportIdError,
    InvalidReportNullifierError,
    InvalidReportStatusError,
} from '../types'

export default (
    app: Express,
    db: DB,
    synchronizer: UnirepSocialSynchronizer
) => {
    app.post(
        '/api/report',
        errorHandler(checkReputation),
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
        errorHandler(checkReputation),
        errorHandler(async (req, res) => {
            // report id is generated by nanoid, not a number
            const id = req.params.id
            if (!id) {
                throw InvalidReportIdError
            }

            const { nullifier, adjudicateValue } = req.body

            if (!nullifier) {
                throw InvalidReportNullifierError
            }

            if (
                !Validator.isValidNumber(adjudicateValue) ||
                !(adjudicateValue in AdjudicateValue)
            ) {
                throw InvalidAdjudicateValueError
            }

            await reportService.voteOnReport(id, nullifier, adjudicateValue, db)

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
