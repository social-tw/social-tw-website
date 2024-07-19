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
