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
