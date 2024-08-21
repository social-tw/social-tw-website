import { DB } from 'anondb'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import {
    AdjudicateValue,
    Adjudicator,
    CommentNotExistError,
    CommentReportedError,
    InternalError,
    InvalidCommentIdError,
    InvalidParametersError,
    InvalidPostIdError,
    InvalidReportNullifierError,
    InvalidReportStatusError,
    PostNotExistError,
    PostReportedError,
    ReportCategory,
    ReportHistory,
    ReportNotExistError,
    ReportObjectTypeNotExistsError,
    ReportStatus,
    ReportType,
    ReportVotingEndedError,
    UserAlreadyClaimedError,
    UserAlreadyVotedError,
} from '../types'
import { CommentStatus } from '../types/Comment'
import { PostStatus } from '../types/Post'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import ProofHelper from './utils/ProofHelper'
import Validator from './utils/Validator'
import express from 'express'
import {
    ClaimHelpers,
    ClaimMethods,
    RepChangeType,
    RepUserType,
    ReputationDirection,
    ReputationType,
} from '../types/Reputation'
import { genVHelperIdentifier } from '../services/utils/ProofHelper'
import TransactionManager from './utils/TransactionManager'

export class ReportService {
    private helpersMap: Record<RepUserType, ClaimHelpers> = {
        [RepUserType.VOTER]: ClaimHelpers.ReportNullifierVHelper,
        [RepUserType.POSTER]: ClaimHelpers.ReportNonNullifierVHelper,
        [RepUserType.REPORTER]: ClaimHelpers.ReportNonNullifierVHelper,
    }

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
            if (post.status === PostStatus.REPORTED) throw PostReportedError
            reportData.respondentEpochKey = post.epochKey
        } else if (reportData.type === ReportType.COMMENT) {
            if (!Validator.isValidNumber(reportData.objectId))
                throw InvalidCommentIdError
            const comment = await commentService.fetchSingleComment(
                reportData.objectId.toString(),
                db
            )
            if (!comment) throw CommentNotExistError
            if (comment.status === CommentStatus.REPORTED)
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
        // get the latest reportId
        const reportId = await db
            .count('ReportHistory', {})
            .then((count) => count.toString())

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
                PostStatus.REPORTED,
                db
            )
        } else if (reportData.type === ReportType.COMMENT) {
            commentService.updateCommentStatus(
                reportData.objectId,
                CommentStatus.REPORTED,
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

        // fetch object(post / comment) and add into report
        const reports = await db.findMany('ReportHistory', condition)
        for (let i = 0; i < reports.length; i++) {
            const report = reports[i]
            const tableName =
                report.type == ReportType.POST ? 'Post' : 'Comment'
            const object = await db.findOne(tableName, {
                where: {
                    [`${tableName.toLocaleLowerCase()}Id`]: report.objectId,
                },
            })
            reports[i].object = object
        }
        return reports
    }

    async voteOnReport(
        reportId: string,
        adjudicateValue: AdjudicateValue,
        publicSignals: PublicSignals,
        proof: Groth16Proof,
        synchronizer: UnirepSocialSynchronizer,
        db: DB
    ) {
        const report = await this.fetchSingleReport(reportId, db)
        const nullifier = publicSignals[0]

        if (!report) throw ReportNotExistError
        if (report.status != ReportStatus.VOTING) throw ReportVotingEndedError
        await ProofHelper.getAndVerifyReportIdentityProof(
            publicSignals,
            proof,
            synchronizer
        )
        // check if user voted or not
        if (this.isVoted(nullifier, report)) throw UserAlreadyVotedError

        const adjudicatorsNullifier = this.upsertAdjudicatorsNullifier(
            nullifier,
            adjudicateValue,
            report
        )
        // default value is 0, but insert statement doesn't have this field
        // if this field is undefined, assume no one has voted yet.
        const adjudicateCount = (report.adjudicateCount ?? 0) + 1

        // update adjudicatorsNullifier && adjudicateCount
        await db.update('ReportHistory', {
            where: {
                reportId,
            },
            update: {
                adjudicatorsNullifier,
                adjudicateCount,
            },
        })
    }

    upsertAdjudicatorsNullifier(
        nullifier: string,
        adjudicateValue: AdjudicateValue,
        report: ReportHistory
    ): Adjudicator[] {
        const newAdjudicator = {
            nullifier: nullifier,
            adjudicateValue: adjudicateValue,
            claimed: false,
        }

        return report.adjudicatorsNullifier
            ? [...report.adjudicatorsNullifier, newAdjudicator]
            : [newAdjudicator]
    }

    isVoted(nullifier: string, report: ReportHistory): boolean {
        // get all adjudicators from report
        const adjudicators = report.adjudicatorsNullifier

        // if nullifer is included in adjudicators, return true
        return adjudicators
            ? adjudicators.some(
                  (adjudicator) => adjudicator.nullifier == nullifier
              )
            : false
    }

    async fetchSingleReport(
        reportId: string,
        db: DB
    ): Promise<ReportHistory | null> {
        const report = await db.findOne('ReportHistory', {
            where: {
                reportId,
            },
        })

        return report
    }

    fetchReportCategory() {
        return [
            {
                number: ReportCategory.ATTACK,
                description:
                    '對使用者、特定個人、組織或群體發表中傷、歧視、挑釁、羞辱、謾罵、不雅字詞或人身攻擊等言論',
            },
            {
                number: ReportCategory.SPAM,
                description:
                    '張貼商業廣告內容與連結、邀請碼或內含個人代碼的邀請連結等',
            },
            {
                number: ReportCategory.R18,
                description:
                    '張貼色情裸露、性暗示意味濃厚的內容，惟內容具教育性者不在此限',
            },
            {
                number: ReportCategory.VIOLATION,
                description: '違反政府法令之情事',
            },
            {
                number: ReportCategory.DUPLICATE,
                description: '重複張貼他人已發表過且完全相同的內容',
            },
            {
                number: ReportCategory.MEANINGLESS,
                description: '文章內容空泛或明顯無意義內容',
            },
            {
                number: ReportCategory.OTHER,
                description: '其他',
            },
        ]
    }

    async claimPositiveReputation(
        req: express.Request,
        res: express.Response,
        db: DB
    ) {
        await this.claimReputation(
            req,
            res,
            db,
            ClaimMethods.CLAIM_POSITIVE_REP,
            ReputationDirection.POSITIVE
        )
    }

    async claimNegativeReputation(
        req: express.Request,
        res: express.Response,
        db: DB
    ) {
        await this.claimReputation(
            req,
            res,
            db,
            ClaimMethods.CLAIM_NEGATIVE_REP,
            ReputationDirection.NEGATIVE
        )
    }

    async claimReputation(
        req: express.Request,
        res: express.Response,
        db: DB,
        claimMethod: ClaimMethods,
        direction: ReputationDirection
    ) {
        try {
            const { reportId, claimSignals, claimProof, repUserType } = req.body

            let nullifier: string | undefined
            if (repUserType === RepUserType.VOTER) {
                nullifier = claimSignals[2]
            }

            this.validateInputs(reportId, claimSignals, claimProof, repUserType)

            const report = await this.getReport(
                db,
                reportId,
                repUserType,
                nullifier
            )

            this.checkReputationClaim(report, repUserType, direction, nullifier)

            const change = this.getReputationChange(direction, repUserType)
            const helper = this.getClaimHelper(repUserType, direction)
            const identifier = genVHelperIdentifier(helper)

            const txHash = await this.executeContractCall(
                claimMethod,
                claimSignals,
                claimProof,
                identifier,
                change
            )

            await this.updateReputationStatus(
                db,
                direction,
                reportId,
                nullifier,
                repUserType
            )

            const repType = this.getReputationType(direction, repUserType)
            await this.createReputationHistory(
                db,
                txHash,
                change,
                repType,
                reportId,
                report
            )

            this.sendSuccessResponse(
                res,
                txHash,
                reportId,
                repType,
                change,
                report
            )
        } catch (error: any) {
            this.handleError(res, error, direction)
        }
    }

    private validateInputs(
        reportId: string,
        claimSignals: any,
        claimProof: any,
        repUserType: RepUserType
    ) {
        if (
            !reportId ||
            !claimSignals ||
            !claimProof ||
            repUserType === undefined
        ) {
            throw InvalidParametersError
        }
        if (!Object.values(RepUserType).includes(repUserType)) {
            throw InvalidParametersError
        }
    }

    private async getReport(
        db: DB,
        reportId: string,
        repUserType: RepUserType,
        nullifier?: string
    ) {
        if (repUserType === RepUserType.VOTER) {
            if (!nullifier) throw InvalidParametersError
            const report = await this.findReportWithNullifier(
                db,
                reportId,
                nullifier,
                ReportStatus.WAITING_FOR_TRANSACTION
            )
            if (!report) throw ReportNotExistError
            return report
        } else {
            const whereClause = this.getReportWhereClause(reportId)
            const report = await db.findOne('ReportHistory', {
                where: whereClause,
            })
            if (!report) throw ReportNotExistError
            return report
        }
    }

    private getReportWhereClause(reportId: string) {
        return {
            reportId,
            status: ReportStatus.WAITING_FOR_TRANSACTION,
        }
    }

    private checkReputationClaim(
        report: ReportHistory,
        repUserType: RepUserType,
        direction: ReputationDirection,
        nullifier?: string
    ) {
        if (direction === ReputationDirection.NEGATIVE) {
            if (
                repUserType === RepUserType.REPORTER &&
                report.reportorClaimedRep
            )
                throw UserAlreadyClaimedError
            if (
                repUserType === RepUserType.POSTER &&
                report.respondentClaimedRep
            )
                throw UserAlreadyClaimedError
        } else {
            if (
                repUserType === RepUserType.REPORTER &&
                report.reportorClaimedRep
            )
                throw UserAlreadyClaimedError
            if (repUserType === RepUserType.VOTER) {
                if (!nullifier) throw InvalidParametersError
                if (!report) throw InvalidReportNullifierError
                if (
                    report.adjudicatorsNullifier?.some(
                        (adj: any) => adj.nullifier === nullifier && adj.claimed
                    )
                ) {
                    throw UserAlreadyClaimedError
                }
            }
        }
    }

    private getReputationChange(
        direction: ReputationDirection,
        repUserType: RepUserType
    ): RepChangeType {
        switch (direction) {
            case ReputationDirection.POSITIVE:
                switch (repUserType) {
                    case RepUserType.REPORTER:
                        return RepChangeType.REPORTER_REP
                    case RepUserType.VOTER:
                        return RepChangeType.VOTER_REP
                    case RepUserType.POSTER:
                        throw new Error(
                            'Invalid combination: POSITIVE direction for POSTER'
                        )
                }
                break
            case ReputationDirection.NEGATIVE:
                switch (repUserType) {
                    case RepUserType.REPORTER:
                        return RepChangeType.FAILED_REPORTER_REP
                    case RepUserType.POSTER:
                        return RepChangeType.POSTER_REP
                    case RepUserType.VOTER:
                        throw new Error(
                            'Invalid combination: NEGATIVE direction for VOTER'
                        )
                }
                break
        }
        throw new Error('Invalid direction or repUserType')
    }

    private async executeContractCall(
        claimMethod: ClaimMethods,
        claimSignals: any,
        claimProof: any,
        identifier: string,
        change: RepChangeType
    ) {
        return await TransactionManager.callContract(claimMethod, [
            claimSignals,
            claimProof,
            identifier,
            change,
        ])
    }

    private async createReputationHistory(
        db: DB,
        txHash: string,
        change: RepChangeType,
        repType: ReputationType,
        reportId: string,
        report: ReportHistory
    ) {
        await db.create('ReputationHistory', {
            transactionHash: txHash,
            epoch: report.reportEpoch,
            epochKey: report.respondentEpochKey,
            score: change,
            type: repType,
            reportId,
        })
    }

    private sendSuccessResponse(
        res: express.Response,
        txHash: string,
        reportId: string,
        repType: ReputationType,
        change: RepChangeType,
        report: ReportHistory
    ) {
        res.status(200).json({
            message: {
                txHash,
                reportId,
                epoch: report.reportEpoch,
                epochKey: report.respondentEpochKey,
                type: repType,
                score: change,
            },
        })
    }

    private handleError(
        res: express.Response,
        error: any,
        direction: ReputationDirection
    ) {
        console.error(`Get ${direction} Reputation error:`, error)
        if (error instanceof InternalError) {
            res.status(error.httpStatusCode).json({
                message: error.message,
                error: error.message,
            })
        } else {
            res.status(500).json({
                message: `Get ${direction} Reputation error`,
                error: error.message,
                stack: error.stack,
            })
        }
    }

    private async updateReputationStatus(
        db: DB,
        type: ReputationDirection,
        reportId: string,
        nullifier?: string | undefined,
        repUserType?: RepUserType
    ) {
        if (type === ReputationDirection.POSITIVE && nullifier) {
            const report = await this.findReportWithNullifier(
                db,
                reportId,
                nullifier,
                ReportStatus.WAITING_FOR_TRANSACTION
            )
            if (!report) throw ReportNotExistError

            if (report) {
                const updatedAdjudicators = report.adjudicatorsNullifier.map(
                    (adj) =>
                        adj.nullifier === nullifier
                            ? { ...adj, claimed: true }
                            : adj
                )

                await db.update('ReportHistory', {
                    where: { _id: report._id },
                    update: {
                        adjudicatorsNullifier: updatedAdjudicators,
                    },
                })
            }
        } else {
            let updateField: string

            if (type === ReputationDirection.POSITIVE) {
                updateField = 'reportorClaimedRep'
            } else {
                if (repUserType === RepUserType.REPORTER) {
                    updateField = 'reportorClaimedRep'
                } else if (repUserType === RepUserType.POSTER) {
                    updateField = 'respondentClaimedRep'
                } else {
                    throw new Error(
                        'Invalid repUserType for negative reputation'
                    )
                }
            }

            const updateQuery = { [updateField]: true }
            await db.update('ReportHistory', {
                where: {
                    reportId,
                },
                update: updateQuery,
            })
        }
    }

    async findReportWithNullifier(
        db: DB,
        reportId: string,
        nullifier: string,
        status: ReportStatus
    ) {
        const reports = await db.findMany('ReportHistory', {
            where: {
                reportId,
                status: status,
            },
        })

        return reports.find((report) =>
            report.adjudicatorsNullifier.some(
                (adj) => adj.nullifier === nullifier
            )
        )
    }

    private getReputationType(
        direction: ReputationDirection,
        repUserType: RepUserType
    ): ReputationType {
        switch (direction) {
            case ReputationDirection.POSITIVE:
                switch (repUserType) {
                    case RepUserType.VOTER:
                        return ReputationType.ADJUDICATE;
                    case RepUserType.REPORTER:
                        return ReputationType.REPORT_SUCCESS;
                    case RepUserType.POSTER:
                        throw new Error('Invalid combination: POSITIVE direction for POSTER');
                }
                break;
            case ReputationDirection.NEGATIVE:
                switch (repUserType) {
                    case RepUserType.VOTER:
                        throw new Error('Invalid combination: NEGATIVE direction for VOTER');
                    case RepUserType.REPORTER:
                        return ReputationType.REPORT_FAILURE;
                    case RepUserType.POSTER:
                        return ReputationType.BE_REPORTED;
                }
                break;
            default:
                throw new Error('Invalid ReputationDirection');
        }
    }

    private getClaimHelper(
        repUserType: RepUserType,
        direction: ReputationDirection
    ): ClaimHelpers {
        if (
            repUserType === RepUserType.REPORTER &&
            direction === ReputationDirection.NEGATIVE
        ) {
            // Special case for FAILED_REPORTER
            return ClaimHelpers.ReportNonNullifierVHelper
        }
        return this.helpersMap[repUserType]
    }
}

export const reportService = new ReportService()
