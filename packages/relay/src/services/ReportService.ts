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
    InvalidCommentIdError,
    InvalidParametersError,
    InvalidPostIdError,
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
    UserAlreadyVotedError,
    InvalidAttesterIdError,
} from '../types'
import { CommentStatus } from '../types/Comment'
import { PostStatus } from '../types/Post'
import { UnirepSocialSynchronizer } from './singletons/UnirepSocialSynchronizer'
import ProofHelper from './utils/ProofHelper'
import Validator from './utils/Validator'
import { ethers } from 'ethers'
import express from 'express'
import {
    ClaimHelpers,
    ClaimMethods,
    ReputationDirection,
} from '../types/Reputation'

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
        nullifier: string,
        adjudicateValue: AdjudicateValue,
        db: DB
    ) {
        const report = await this.fetchSingleReport(reportId, db)
        if (!report) throw ReportNotExistError
        if (report.status != ReportStatus.VOTING) throw ReportVotingEndedError
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
        db: DB,
        synchronizer: UnirepSocialSynchronizer
    ) {
        await this.claimReputation(
            req,
            res,
            db,
            synchronizer,
            ClaimMethods.CLAIM_POSITIVE_REP,
            ClaimHelpers.POSITIVE_REP_HELPER,
            ReputationDirection.POSITIVE
        )
    }

    async claimNegativeReputation(
        req: express.Request,
        res: express.Response,
        db: DB,
        synchronizer: UnirepSocialSynchronizer
    ) {
        await this.claimReputation(
            req,
            res,
            db,
            synchronizer,
            ClaimMethods.CLAIM_NEGATIVE_REP,
            ClaimHelpers.NEGATIVE_REP_HELPER,
            ReputationDirection.NEGATIVE
        )
    }

    async claimReputation(
        req: express.Request,
        res: express.Response,
        db: DB,
        synchronizer: UnirepSocialSynchronizer,
        claimMethod: ClaimMethods,
        helper: ClaimHelpers,
        direction: ReputationDirection
    ) {
        try {
            const { publicSignals, proof, change } = req.body

            if (!publicSignals || !proof || change === undefined)
                throw InvalidParametersError

            // Verify the proof
            const epochKeyProof = await ProofHelper.getAndVerifyEpochKeyProof(
                publicSignals,
                proof,
                synchronizer
            )

            // Now we can use the verified epoch from the proof
            const epoch = Number(epochKeyProof.epoch)
            const epochKey = epochKeyProof.epochKey.toString()

            // Check attesterId
            const attesterId = BigInt(synchronizer.attesterId)
            if (attesterId !== BigInt(publicSignals[3])) {
                throw InvalidAttesterIdError
            }

            // use synchronizer's contract instance to call claim method
            const tx = await synchronizer.unirepSocialContract[claimMethod](
                publicSignals,
                proof,
                ethers.utils.id(helper),
                change
            )
            await tx.wait()

            // update reputation status in database
            await this.updateReputationStatus(
                epochKey,
                direction,
                true,
                db,
                epoch
            )

            res.status(200).json({
                message: `Success get ${direction} Reputation`,
            })
        } catch (error: any) {
            console.error(`Get ${direction} Reputation error:`, error)
            res.status(500).json({
                message: `Get ${direction} Reputation error`,
                error: error.message,
                stack: error.stack,
            })
        }
    }

    private async updateReputationStatus(
        epochKey: string,
        type: ReputationDirection,
        claimed: boolean,
        db: DB,
        epoch: number
    ) {
        await db.update('ReportHistory', {
            where: {
                [type === ReputationDirection.POSITIVE
                    ? 'reportorEpochKey'
                    : 'respondentEpochKey']: epochKey,
                reportEpoch: epoch,
            },
            update: {
                [type === ReputationDirection.POSITIVE
                    ? 'reportorClaimedRep'
                    : 'respondentClaimedRep']: claimed,
            },
        })
    }
}

export const reportService = new ReportService()
