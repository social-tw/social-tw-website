export enum ReportType {
    POST = 0,
    COMMENT = 1,
}

export enum ReportCategory {
    ATTACK = 0,
    SPAM = 1,
    R18 = 2,
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

export enum ReputationType {
    REPORT_SUCCESS = 'REPORT_SUCCESS',
    REPORT_FAILURE = 'REPORT_FAILURE',
    BE_REPORTED = 'BE_REPORTED',
    ADJUDICATE = 'ADJUDICATE',
}

export enum ReportStatus {
    VOTING,
    WAITING_FOR_TRANSACTION,
    COMPLETED,
}
