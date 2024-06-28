export enum ReportStatus {
    VOTING = 0,
    WAITING_FOR_TRANSACTION = 1,
    COMPLETED = 2,
}

export enum ReportCategory {
    ATTACK = 0, // 對使用者、特定個人、組織或群體發表中傷、歧視、挑釁、羞辱、謾罵、不雅字詞或人身攻擊等言論
    SPAM = 1, // 張貼商業廣告內容與連結、邀請碼或內含個人代碼的邀請連結等
    R18 = 2, // 張貼色情裸露、性暗示意味濃厚的內容，惟內容具教育性者不在此限
}

export enum ReportType {
    POST = 0,
    COMMENT = 1,
}

export type Adjudicator = {
    nullifier: string
    adjudicateValue: number // 1: agree, 0: disagree
    claimed: boolean // TRUE: claimed, FALSE: not claimed
}

export interface ReportHistory {
    reportId?: string
    type: number // 0: Post, 1: Comment
    objectId: string // PostId or CommentId
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

export enum AdjudicateValue {
    DISAGREE,
    AGREE,
}
