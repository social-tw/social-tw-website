import { DB } from 'anondb'
import { nanoid } from 'nanoid'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import { ReportHistory, ReportStatus, ReportType } from '../types'
import { CommentStatus } from '../types/Comment'
import {
    CommentNotExistError,
    CommentReportedError,
    InvalidCommentIdError,
    InvalidPostIdError,
    InvalidReportStatusError,
    PostNotExistError,
    PostReportedError,
    ReportObjectTypeNotExistsError
} from '../types/InternalError'
import { PostStatus } from '../types/Post'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import ProofHelper from './utils/ProofHelper'
import Validator from './utils/Validator'

export class ReportService {
    async verifyReportData(
        db: DB,
        reportData: ReportHistory,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<ReportHistory> {
        // 1.a Check if the post / comment exists is not reported already(post status = 1 / comment status = 1)
        if (reportData.type === ReportType.POST) {
            if (!Validator.isValidNumber(reportData.objectId))
                throw InvalidPostIdError

            const post = await postService.fetchSinglePost(
                reportData.objectId.toString(),
                db
            )
            if (!post) throw PostNotExistError
            if (post.status === PostStatus.Reported) throw PostReportedError
            reportData.respondentEpochKey = post.epochKey
        } else if (reportData.type === ReportType.COMMENT) {
            if (!Validator.isValidNumber(reportData.objectId))
                throw InvalidCommentIdError
            const comment = await commentService.fetchSingleComment(
                reportData.objectId.toString(),
                db
            )
            if (!comment) throw CommentNotExistError
            if (comment.status === CommentStatus.Reported)
                throw CommentReportedError
            reportData.respondentEpochKey = comment.epochKey
        } else {
            throw ReportObjectTypeNotExistsError
        }
        // 1.b Check if the epoch key is valid
        await ProofHelper.getAndVerifyEpochKeyProof(
            publicSignals,
            proof,
            synchronizer
        )
        return reportData
    }

    async createReport(db: DB, reportData: ReportHistory): Promise<string> {
        const reportId = nanoid()
        await db.create('ReportHistory', {
            reportId: reportId,
            type: reportData.type,
            objectId: reportData.objectId,
            reportorEpochKey: reportData.reportorEpochKey,
            respondentEpochKey: reportData.respondentEpochKey,
            reason: reportData.reason,
            category: reportData.category,
            reportEpoch: reportData.reportEpoch,
        })
        return reportId
    }

    async updateObjectStatus(db: DB, reportData: ReportHistory) {
        if (reportData.type === ReportType.POST) {
            postService.updatePostStatus(
                reportData.objectId,
                PostStatus.Reported,
                db
            )
        } else if (reportData.type === ReportType.COMMENT) {
            commentService.updateCommentStatus(
                reportData.objectId,
                CommentStatus.Reported,
                db
            )
        }
    }

    async fetchReport(
        status: ReportStatus,
        synchronizer: UnirepSocialSynchronizer,
        db: DB
    ): Promise<any[]> {
        const epoch = synchronizer.calcCurrentEpoch()
        let reports

        switch (status) {
            // VOTEING reports meet below condition
            // 1. reportEpoch = current Epoch - 1
            // 2. the result of adjudication is tie, should vote again
            case ReportStatus.VOTING:
                reports = await db.findMany('ReportHistory', {
                    where: {
                        AND: [
                            {reportEpoch: epoch - 1 },
                            {status: ReportStatus.VOTING}
                        ]
                    },
                })

                // fetch all reports whose status is still voting
                const allReports = await db.findMany('ReportHistory', {
                    where: {
                        AND: [
                            {reportEpoch: { lt: epoch - 1 }},
                            {status: ReportStatus.VOTING}
                        ]
                    }
                })

                for (let i = 0; i < allReports.length; i++) {
                    const report = allReports[i];
                    if (report.adjudicateCount < 5) {
                        continue
                    }
                    // flatMap adjudicatorsNullifier to [adjudicateValue1, adjudicateValue2, adjudicateValue3]
                    // agree: 1, disagree: 0, if the value is disagree, then -1
                    const result = report.adjudicatorsNullifier.rows.flatMap((nullifier) => nullifier.adjudicateValue)
                    .reduce((acc, value) => {
                        if (Number(value) == 0) {
                            return acc - 1
                        }
                        return acc + 1
                    })

                    // the result of adjudication is tie
                    if (result == 0) {
                        reports.push(report)
                    }
                }
                break
            // WAITING_FOR_TRANSACTION is for client side to claim reputation use
            case ReportStatus.WAITING_FOR_TRANSACTION:
                reports = await db.findMany('ReportHistory', {
                    where: {
                        AND: [
                            { reportEpoch: { lt: epoch } },
                            { status: ReportStatus.WAITING_FOR_TRANSACTION },
                        ],
                    },
                })
            default:
                throw InvalidReportStatusError
        }

        return reports
    }
}

export const reportService = new ReportService()
