import { DB } from 'anondb'
import { nanoid } from 'nanoid'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import {
    AdjudicateValue,
    Adjudicator,
    CommentNotExistError,
    CommentReportedError,
    InvalidAdjudicateValueError,
    InvalidCommentIdError,
    InvalidPostIdError,
    InvalidReportError,
    InvalidReportStatusError,
    PostNotExistError,
    PostReportedError,
    ReportHistory,
    ReportObjectTypeNotExistsError,
    ReportStatus,
    ReportType,
    UserAlreadyVotedError,
} from '../types'
import { CommentStatus } from '../types/Comment'
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

    async fetchReports(
        status: ReportStatus,
        synchronizer: UnirepSocialSynchronizer,
        db: DB
    ): Promise<ReportHistory[] | null> {
        const epoch = await synchronizer.loadCurrentEpoch()

        const statusCondition = {
            // VOTING reports meet below condition
            // 1. reportEpoch = current Epoch - 1
            // 2. the result of adjudication is tie, should vote again
            // p.s. synchronizer would handle the adjudication result,
            // we can assume all reports whose status is VOTING are already handled by synchronizer
            [ReportStatus.VOTING]: {
                where: {
                    AND: [
                        { reportEpoch: { lt: epoch } },
                        { status: ReportStatus.VOTING },
                    ],
                },
            },
            // WAITING_FOR_TRANSACTION is for client side to claim reputation use
            // reports whose report epoch is equal to current epoch are pending reports
            // the status should be always VOTING, so the where clause don't search
            // current epoch
            [ReportStatus.WAITING_FOR_TRANSACTION]: {
                where: {
                    AND: [
                        { reportEpoch: { lt: epoch } },
                        { status: ReportStatus.WAITING_FOR_TRANSACTION },
                    ],
                },
            },
        }

        const condition = statusCondition[status]
        if (!condition) {
            throw InvalidReportStatusError
        }

        return await db.findMany('ReportHistory', condition)
    }

    async voteOnReport(
        id: string,
        nullifier: string,
        adjudicateValue: AdjudicateValue,
        db: DB
    ) {
        const report = await this.fetchSingleReport(id, db)
        if (!report) {
            throw InvalidReportError
        }

        // check if user voted or not
        if (this.isVoted(nullifier, report)) {
            throw UserAlreadyVotedError
        }

        const adjudicatorsNullifier = this.upsertAdjudicatorsNullifier(
            nullifier,
            adjudicateValue,
            report
        )
        // default value is 0, but insert statement doesn't have this field
        // if this field is undefined, assume no one has voted yet.
        const adjudicateCount = report.adjudicateCount?? 0 

        // update adjudicatorsNullifier && adjudicateCount
        await db.update('ReportHistory', {
            where: {
                reportId: id,
            },
            update: {
                adjudicatorsNullifier: adjudicatorsNullifier,

                adjudicateCount: adjudicateCount + 1,
            },
        })
    }

    upsertAdjudicatorsNullifier(
        nullifier: string,
        adjudicateValue: AdjudicateValue,
        report: ReportHistory
    ): Adjudicator[] {
        const adjudicator = {
            nullifier: nullifier,
            claimed: false,
        }

        switch (adjudicateValue) {
            case AdjudicateValue.AGREE:
                adjudicator[adjudicateValue] = 1
                break
            case AdjudicateValue.DISAGREE:
                adjudicator[adjudicateValue] = 0
                break
            default:
                throw InvalidAdjudicateValueError
        }

        let adjudicatorsNullifier
        if (!report.adjudicatorsNullifier) {
            // if this is the first time to vote on the report, create an adjudicatorsNullifier array
            adjudicatorsNullifier = [adjudicator]
        } else {
            // push the new adjudicator into adjudicatorsNullifier
            adjudicatorsNullifier = report.adjudicatorsNullifier.push(adjudicator as Adjudicator)
        }

        return adjudicatorsNullifier
    }

    isVoted(nullifier: string, report: ReportHistory): boolean {
        // get all adjudicators from report
        const adjudicators = report.adjudicatorsNullifier
        if (!adjudicators || adjudicators.length == 0) {
            return false
        }

        // if nullifer is included in adjudicators, return true
        return adjudicators.some(
            (adjudicator) => adjudicator.nullifier == nullifier
        )
    }

    async fetchSingleReport(id: string, db: DB): Promise<ReportHistory | null> {
        const report = await db.findOne('ReportHistory', {
            where: {
                reportId: id
            },
        })

        return report
    }
}

export const reportService = new ReportService()
