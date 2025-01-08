import { ReportHistory } from './Report'

export enum ReputationType {
    REPORT_SUCCESS,
    REPORT_FAILURE,
    BE_REPORTED,
    ADJUDICATE,
    CHECK_IN,
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
    ReportNullifierVHelper = 'reportNullifierProofVerifierHelper',
    ReportNonNullifierVHelper = 'reportNonNullifierProofVerifierHelper',
    DailyClaimVHelper = 'dailyClaimVerifierHelper',
}

// Reputation change amount
export enum RepChangeType {
    REPORTER_REP = 3,
    RESPONDENT_REP = 5,
    FAILED_REPORTER_REP = 1,
    ADJUDICATOR_REP = 1,
    CHECK_IN_REP = 1,
}

// Reputation user type
export enum RepUserType {
    REPORTER,
    RESPONDENT,
    ADJUDICATOR,
}
