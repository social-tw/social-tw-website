export enum CommentStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    Deleted = 'deleted',
    Reported = 'reported',
}

export interface FetchCommentsByEpochKeysParams {
    epochKeys: bigint[]
}

// For displaying in the main page components
export interface CommentInfo {
    commentId: string
    postId: string
    epoch: number
    epochKey?: string
    content: string
    transactionHash: string
    publishedAt: number | string
    status: CommentStatus
    isMine: boolean
}

// For socket uses
export interface CommentMsg {
    id: string
    postId: string
    content: string
    epochKey: string
    epoch: number
}

// For fromat in profile/history
export interface CommentHistoryMetaData {
    id: string
    postId: string
    epochKey: string
    publishedAt: number
    content: string
    voteSum: number
    date: string
    url: string
}

export enum RelayRawCommentStatus {
    NOT_ON_CHAIN,
    ON_CHAIN,
    REPORTED,
    DISAGREED,
    DELETED,
}

export interface RelayRawComment {
    publishedAt: string
    commentId: string
    postId: string
    cid: string
    transactionHash: string
    content: string
    epoch: number
    epochKey: string
    status: RelayRawCommentStatus
    _id: string
}
