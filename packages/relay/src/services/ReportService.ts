import { DB } from 'anondb'
import { Groth16Proof, PublicSignals } from 'snarkjs'
import {
    ReportNonNullifierProof,
    ReportNullifierProof,
} from '../../../circuits/src'
import { REPORT_SETTLE_VOTE_THRESHOLD } from '../config'
import { commentService } from '../services/CommentService'
import { postService } from '../services/PostService'
import {
    AdjudicateValue,
    Adjudicator,
    Errors,
    ReportCategory,
    ReportHistory,
    ReportStatus,
    ReportType,
} from '../types'
import { CommentStatus } from '../types/Comment'
import { PostStatus } from '../types/Post'
import {
    ClaimHelpers,
    ClaimMethods,
    RepChangeType,
    RepUserType,
    ReputationType,
} from '../types/Reputation'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import ProofHelper from './utils/ProofHelper'
import TransactionManager from './utils/TransactionManager'
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
            if (reportData.postId) throw Errors.INVALID_POST_ID()
            if (!Validator.isValidNumber(reportData.objectId))
                throw Errors.INVALID_POST_ID()

            const post = await postService.fetchSinglePost(
                reportData.objectId.toString(),
                db
            )
            if (!post) throw Errors.POST_NOT_EXIST()
            if (post.status === PostStatus.REPORTED)
                throw Errors.POST_REPORTED()
            reportData.respondentEpochKey = post.epochKey
        } else if (reportData.type === ReportType.COMMENT) {
            if (!reportData.postId) throw Errors.MISSING_POST_ID()
            if (!Validator.isValidNumber(reportData.objectId))
                throw Errors.INVALID_COMMENT_ID()
            const comment = await commentService.fetchSingleComment(
                reportData.objectId.toString(),
                db
            )
            if (!comment) throw Errors.COMMENT_NOT_EXIST()
            if (comment.status === CommentStatus.REPORTED)
                throw Errors.COMMENT_REPORTED()
            reportData.respondentEpochKey = comment.epochKey
        } else {
            throw Errors.REPORT_OBJECT_TYPE_NOT_EXISTS()
        }
        // verify reputation proof
        const reputationProof = await ProofHelper.getAndVerifyReputationProof(
            publicSignals,
            proof,
            synchronizer
        )

        // check negative reputation
        const maxRep = reputationProof.maxRep
        const proveMaxRep = reputationProof.proveMaxRep

        if (maxRep > 0 && proveMaxRep > 0)
            throw Errors.NEGATIVE_REPUTATION_USER()

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
            postId: reportData.postId,
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
                        {
                            adjudicateCount: {
                                lt: parseInt(REPORT_SETTLE_VOTE_THRESHOLD),
                            },
                        },
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
        if (!condition) throw Errors.INVALID_REPORT_STATUS()

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

        if (!report) throw Errors.REPORT_NOT_EXIST()
        if (report.status != ReportStatus.VOTING)
            throw Errors.REPORT_VOTING_ENDED()
        await ProofHelper.getAndVerifyReportIdentityProof(
            publicSignals,
            proof,
            synchronizer
        )
        // check if user voted or not
        if (this.isVoted(nullifier, report)) throw Errors.USER_ALREADY_VOTED()

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

    async createReputationHistory(
        db: DB,
        txHash: string,
        change: RepChangeType,
        repType: ReputationType,
        reportId: string,
        reportProof: ReportNullifierProof | ReportNonNullifierProof
    ) {
        await db.create('ReputationHistory', {
            transactionHash: txHash,
            epoch: Number(reportProof.epoch),
            epochKey: String(reportProof.currentEpochKey),
            score: change,
            type: repType,
            reportId,
        })
    }

    private isReportCompleted(report: ReportHistory): boolean {
        const allAdjudicatorsClaimed = report.adjudicatorsNullifier?.length
            ? report.adjudicatorsNullifier.every((adj) => adj.claimed)
            : false

        return (
            !!report.reportorClaimedRep &&
            !!report.respondentClaimedRep &&
            allAdjudicatorsClaimed
        )
    }

    getReputationType(
        isPassed: boolean,
        repUserType: RepUserType
    ): ReputationType {
        switch (repUserType) {
            case RepUserType.ADJUDICATOR:
                return ReputationType.ADJUDICATE
            case RepUserType.REPORTER:
                return isPassed
                    ? ReputationType.REPORT_SUCCESS
                    : ReputationType.REPORT_FAILURE
            case RepUserType.RESPONDENT:
                return ReputationType.BE_REPORTED
            default:
                throw Errors.INVALID_REP_USER_TYPE()
        }
    }

    getClaimHelper(repUserType: RepUserType): ClaimHelpers {
        switch (repUserType) {
            case RepUserType.REPORTER:
            case RepUserType.RESPONDENT:
                return ClaimHelpers.ReportNonNullifierVHelper
            case RepUserType.ADJUDICATOR:
                return ClaimHelpers.ReportNullifierVHelper
            default:
                throw Errors.INVALID_REP_USER_TYPE()
        }
    }

    checkAdjudicatorNullifier(
        report: ReportHistory,
        reportProof: ReportNullifierProof | ReportNonNullifierProof
    ) {
        if (
            !report.adjudicatorsNullifier?.some(
                (adj) =>
                    !(reportProof instanceof ReportNonNullifierProof) &&
                    adj.nullifier === reportProof.reportNullifier.toString()
            )
        ) {
            throw new Error('Invalid adjudicator nullifier')
        }
    }

    checkAdjudicatorIsClaimed(
        report: ReportHistory,
        reportProof: ReportNullifierProof | ReportNonNullifierProof
    ) {
        if (
            report.adjudicatorsNullifier?.some(
                (adj) =>
                    !(reportProof instanceof ReportNonNullifierProof) &&
                    adj.nullifier === reportProof.reportNullifier.toString() &&
                    adj.claimed
            )
        ) {
            throw Errors.USER_ALREADY_CLAIMED()
        }
    }

    checkRespondentEpochKey(
        report: ReportHistory,
        reportProof: ReportNullifierProof | ReportNonNullifierProof
    ) {
        if (
            !(reportProof instanceof ReportNonNullifierProof) ||
            report.respondentEpochKey !==
                reportProof.reportedEpochKey.toString()
        ) {
            throw new Error('Invalid respondent epoch key')
        }
    }

    checkReportorEpochKey(
        report: ReportHistory,
        reportProof: ReportNullifierProof | ReportNonNullifierProof
    ) {
        if (
            !(reportProof instanceof ReportNonNullifierProof) ||
            report.reportorEpochKey !== reportProof.reportedEpochKey.toString()
        ) {
            throw new Error('Invalid reportor epoch key')
        }
    }

    checkRespondentIsClaimed(report: ReportHistory) {
        if (report.respondentClaimedRep) throw Errors.USER_ALREADY_CLAIMED()
    }

    checkReporterIsClaimed(report: ReportHistory) {
        if (report.reportorClaimedRep) throw Errors.USER_ALREADY_CLAIMED()
    }

    getClaimMethod(repUserType: RepUserType, isPassed: boolean): ClaimMethods {
        switch (repUserType) {
            case RepUserType.RESPONDENT:
                if (isPassed) {
                    return ClaimMethods.CLAIM_NEGATIVE_REP
                } else {
                    throw new Error(
                        'Poster cannot claim reputation for failed reports'
                    )
                }
            case RepUserType.REPORTER:
                return isPassed
                    ? ClaimMethods.CLAIM_POSITIVE_REP
                    : ClaimMethods.CLAIM_NEGATIVE_REP
            case RepUserType.ADJUDICATOR:
                return ClaimMethods.CLAIM_POSITIVE_REP
            default:
                throw Errors.INVALID_REP_USER_TYPE()
        }
    }

    getClaimChange(repUserType: RepUserType, isPassed: boolean): RepChangeType {
        switch (repUserType) {
            case RepUserType.REPORTER:
                return isPassed
                    ? RepChangeType.REPORTER_REP
                    : RepChangeType.FAILED_REPORTER_REP
            case RepUserType.ADJUDICATOR:
                return RepChangeType.ADJUDICATOR_REP
            case RepUserType.RESPONDENT:
                return RepChangeType.RESPONDENT_REP
            default:
                throw Errors.INVALID_REP_USER_TYPE()
        }
    }

    checkReportResult(report: ReportHistory): boolean {
        if (
            !report.adjudicatorsNullifier ||
            report.adjudicatorsNullifier.length === 0
        ) {
            return false
        }

        let agreeVotes = 0
        let disagreeVotes = 0

        for (const adjudicator of report.adjudicatorsNullifier) {
            if (adjudicator.adjudicateValue === AdjudicateValue.AGREE) {
                agreeVotes++
            } else if (
                adjudicator.adjudicateValue === AdjudicateValue.DISAGREE
            ) {
                disagreeVotes++
            }
        }

        const passThreshold = 0.5

        return agreeVotes / (agreeVotes + disagreeVotes) > passThreshold
    }

    async updateReportStatus(
        reportId: string,
        repUserType: RepUserType,
        db: DB,
        reportProof: ReportNullifierProof | ReportNonNullifierProof
    ) {
        const report = await this.fetchSingleReport(reportId, db)
        if (!report) throw new Error('Report not found')

        let updates: Partial<ReportHistory> = {}

        switch (repUserType) {
            case RepUserType.REPORTER:
                updates.reportorClaimedRep = true
                break
            case RepUserType.RESPONDENT:
                updates.respondentClaimedRep = true
                break
            case RepUserType.ADJUDICATOR:
                if (!report.adjudicatorsNullifier) {
                    throw new Error('No adjudicators found for this report')
                }
                updates.adjudicatorsNullifier =
                    report.adjudicatorsNullifier.map((adj) => {
                        if (
                            !(reportProof instanceof ReportNonNullifierProof) &&
                            adj.nullifier ===
                                reportProof.reportNullifier.toString()
                        ) {
                            return { ...adj, claimed: true }
                        }
                        return adj
                    })
                break
            default:
                throw Errors.INVALID_REP_USER_TYPE()
        }

        const updatedReport = { ...report, ...updates }

        if (this.isReportCompleted(updatedReport)) {
            updates.status = ReportStatus.COMPLETED
        }

        await db.update('ReportHistory', {
            where: { reportId },
            update: updates,
        })

        return await this.fetchSingleReport(reportId, db)
    }

    async claim(
        claimMethod: ClaimMethods,
        claimChange: RepChangeType,
        identifier: string,
        publicSignals: any,
        proof: any
    ): Promise<string> {
        let txHash: string | undefined

        try {
            txHash = await TransactionManager.callContract(claimMethod, [
                publicSignals,
                proof,
                identifier,
                claimChange,
            ])

            if (!txHash) {
                throw new Error(
                    'Transaction hash is undefined after contract call'
                )
            }

            return txHash
        } catch (error: any) {
            console.error('Error in claiming reputation:', error)
            throw new Error(`Reputation claim failed: ${error.message}`)
        }
    }

    async validateClaimRequest(
        report: ReportHistory,
        repUserType: RepUserType,
        reportProof: ReportNullifierProof | ReportNonNullifierProof
    ) {
        if (repUserType === RepUserType.ADJUDICATOR) {
            this.checkAdjudicatorNullifier(report, reportProof)
            this.checkAdjudicatorIsClaimed(report, reportProof)
        } else if (repUserType === RepUserType.RESPONDENT) {
            this.checkRespondentEpochKey(report, reportProof)
            this.checkRespondentIsClaimed(report)
        } else if (repUserType === RepUserType.REPORTER) {
            this.checkReportorEpochKey(report, reportProof)
            this.checkReporterIsClaimed(report)
        } else {
            throw Errors.INVALID_REP_USER_TYPE()
        }
    }

    async getEpochAndEpochKey(
        claimSignals: any,
        claimProof: any,
        repUserType: RepUserType
    ) {
        let currentEpoch: any, currentEpochKey: any, reportedEpochKey: any
        if (repUserType === RepUserType.ADJUDICATOR) {
            const reportNullifierProof = new ReportNullifierProof(
                claimSignals,
                claimProof
            )
            currentEpoch = reportNullifierProof.epoch
            currentEpochKey = reportNullifierProof.currentEpochKey
        } else {
            const reportNonNullifierProof = new ReportNonNullifierProof(
                claimSignals,
                claimProof
            )
            currentEpoch = reportNonNullifierProof.epoch
            currentEpochKey = reportNonNullifierProof.currentEpochKey
            reportedEpochKey = reportNonNullifierProof.reportedEpochKey
        }

        return { currentEpoch, currentEpochKey, reportedEpochKey }
    }

    async getReportProof(
        claimSignals: any,
        claimProof: any,
        repUserType: RepUserType,
        synchronizer: UnirepSocialSynchronizer
    ): Promise<ReportNullifierProof | ReportNonNullifierProof> {
        if (repUserType === RepUserType.ADJUDICATOR) {
            return new ReportNullifierProof(
                claimSignals,
                claimProof,
                synchronizer.prover
            )
        } else {
            return new ReportNonNullifierProof(
                claimSignals,
                claimProof,
                synchronizer.prover
            )
        }
    }

    async fetchSingleReportWithDetails(
        reportId: string,
        db: DB
    ): Promise<ReportHistory | null> {
        // Fetch the base report
        const report = await this.fetchSingleReport(reportId, db)
        if (!report) return null

        // Fetch the associated object (post or comment)
        const tableName = report.type == ReportType.POST ? 'Post' : 'Comment'
        const object = await db.findOne(tableName, {
            where: {
                [`${tableName.toLowerCase()}Id`]: report.objectId,
            },
        })

        // Return the report with its associated object
        return {
            ...report,
            object: object,
        } as ReportHistory
    }
}

export const reportService = new ReportService()
