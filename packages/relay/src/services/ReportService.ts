import { DB } from 'anondb'
import { PublicSignals, Groth16Proof } from 'snarkjs'
import { nanoid } from 'nanoid'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import { ReportHistory, ReportType } from '../types/Report'
import {
    InvalidPostIdError,
    CommentNotExistError,
} from '../types/InternalError'
import ProofHelper from './utils/ProofHelper'

export class ReportService {
    async verifyReportData(
        db: DB,
        reportData: ReportHistory,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<ReportHistory> {
        // 1.a Check if the post / comment exists is not reported already(post status = 1 / comment status = 1)
        if (reportData.type === ReportType.Post) {
            const post = await postService.fetchSinglePost(
                reportData.objectId.toString(),
                db
            )
            if (!post) throw InvalidPostIdError
            reportData.respondentEpochKey = post.epochKey
        } else if (reportData.type === ReportType.Comment) {
            const comment = await commentService.fetchSingleComment(
                reportData.objectId.toString(),
                db
            )
            if (!comment) throw CommentNotExistError
            reportData.respondentEpochKey = comment.epochKey
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
            reportorClaimedRep: reportData.reportorClaimedRep ?? false,
            respondentEpochKey: reportData.respondentEpochKey,
            respondentClaimedRep: reportData.respondentClaimedRep ?? false,
            reason: reportData.reason,
            adjudicateCount: reportData.adjudicateCount ?? 0,
            adjudicatorsNullifier: reportData.adjudicatorsNullifier,
            status: reportData.status ?? 0,
            category: reportData.category,
            reportEpoch: reportData.reportEpoch,
            reportAt: reportData.reportAt ?? (+new Date()).toString(),
        })
        return reportId
    }

    async updateObjectStatus(db: DB, reportData: ReportHistory) {
        if (reportData.type === ReportType.Post) {
            postService.updatePostStatus(reportData.objectId, 2, db)
        } else if (reportData.type === ReportType.Comment) {
            commentService.updateCommentStatus(reportData.objectId, 3, db)
        }
    }
}

export const reportService = new ReportService()
