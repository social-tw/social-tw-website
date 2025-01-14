import { RelayRawComment } from '@/types/Comments'
import { RelayRawPost } from '@/types/Post'

export type Adjudicator = {
    nullifier: string
    adjudicateValue: number // 1: agree, 0: disagree
    claimed: boolean // TRUE: claimed, FALSE: not claimed
}

export interface ReportHistory {
    reportId: string
    type: ReportType // 0: Post, 1: Comment
    objectId: string // PostId or CommentId
    object: RelayRawPost | RelayRawComment
    reportorEpochKey: string // Epoch Key of the person who reported
    reportorClaimedRep?: boolean // TRUE: claimed, FALSE: not claimed
    respondentEpochKey?: string // Epoch Key of the person who was reported
    respondentClaimedRep?: boolean // TRUE: claimed, FALSE: not claimed
    reason: string // Reason of the report
    adjudicateCount?: number // Number of voters
    adjudicatorsNullifier?: Adjudicator[]
    status?: number // 0: Voting, 1: Waiting for Tx, 2: Completed
    category: number
    reportEpoch: number
    reportAt?: string
}

export enum ReportType {
    POST = 0,
    COMMENT = 1,
}

export interface RelayRawReportCategory {
    number: number
    description: string
}

export enum RepUserType {
    REPORTER,
    RESPONDENT,
    ADJUDICATOR,
}

export enum RepChangeType {
    REPORTER_REP = 3,
    RESPONDENT_REP = 5,
    FAILED_REPORTER_REP = 1,
    ADJUDICATOR_REP = 1,
    CHECK_IN_REP = 1,
}

export enum ReputationType {
    REPORT_SUCCESS,
    REPORT_FAILURE,
    BE_REPORTED,
    ADJUDICATE,
    CHECK_IN,
}

export interface RelayRawReputationHistory {
    transactionHash: string
    epoch: number
    epochKey: string
    score: number
    type: ReputationType
    reportId: string
    report: ReportHistory
}

export enum ReportStatus {
    VOTING,
    WAITING_FOR_TRANSACTION,
    COMPLETED,
}
