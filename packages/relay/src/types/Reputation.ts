import { ReportHistory } from './Report'

export enum ReputationType {
    REPORT_SUCCESS,
    REPORT_FAILURE,
    BE_REPORTED,
    ADJUDICATE,
    CHECK_IN,
}

export enum ReputationDirection {
    POSITIVE,
    NEGATIVE,
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
    POSITIVE_REP_HELPER = 'ReportNullifierVHelper',
    NEGATIVE_REP_HELPER = 'ReportNegRepVHelper',
}
