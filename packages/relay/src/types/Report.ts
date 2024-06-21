export interface ReportHistory {
    reportId?: string
    type: number // 0: Post, 1: Comment
    objectId: string // PostId or CommentId
    reportorEpochKey: string // Epoch Key of the person who reported
    reportorClaimedRep?: boolean // TRUE: claimed, FALSE: not claimed
    respondentEpochKey: string // Epoch Key of the person who was reported
    respondentClaimedRep?: boolean // TRUE: claimed, FALSE: not claimed
    reason: string // Reason of the report
    adjudicateCount?: number // Number of voters
    adjudicatorsNullifier?: {
        // Nullifier of the voter who replied
        nullifier: string
        adjudicateValue: number // 1: agree, 0: disagree
        claimed: boolean // TRUE: claimed, FALSE: not claimed
    }[]
    status?: number // 0: Voting, 1: Waiting for Tx, 2: Completed
    category: number
    reportEpoch: number
    reportAt?: string
}
