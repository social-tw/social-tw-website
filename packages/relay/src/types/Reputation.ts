import { ReportHistory } from './Report'

export enum ReputationType {
    REPORT_SUCCESS,
    REPORT_FAILURE,
    BE_REPORTED,
    ADJUDICATE,
    CHECK_IN,
}

export enum ReputationDirection {
    POSITIVE = 'Positive',
    NEGATIVE = 'Negative',
}

export interface ReputationHistory {
    transactionHash: string
    epoch: number
    epochKey: string
    score: number
    type: ReputationType
    reportId: string
    report: ReportHistory
}

export enum ClaimMethods {
    CLAIM_POSITIVE_REP = 'claimReportPosRep',
    CLAIM_NEGATIVE_REP = 'claimReportNegRep',
}

export enum ClaimHelpers {
    VOTER = 'reportNullifierVHelper',
    POSTER = 'reportNonNullifierVHelper',
    REPORTER = 'reportNonNullifierVHelper',
    FAILED_REPORTER = 'reportNonNullifierVHelper',
}

// Reputation change amount
export enum RepChangeType {
    REPORTER_REP = 3,
    POSTER_REP = 5,
    FAILED_REPORTER_REP = 1,
    VOTER_REP = 1,
}

// Reputation user type
export enum RepUserType {
    REPORTER,
    VOTER,
    POSTER,
}
