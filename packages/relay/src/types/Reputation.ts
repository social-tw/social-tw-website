import { ReportHistory } from './Report'

export enum ReputationType {
    SUCCESSFULL_REPORTER,
    FAILED_REPORTER,
    RESPONDENT,
    ADJUDICATOR,
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
