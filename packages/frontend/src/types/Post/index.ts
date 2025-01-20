import { RelayRawVote, VoteAction } from '../Vote'

export enum PostStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    Deleted = 'deleted',
    Reported = 'reported',
    Blocked = 'blocked',
}

// For displaying in the main page components
export interface PostInfo {
    id: string
    postId: string | undefined
    epochKey: string | undefined
    epoch: number | undefined
    content: string | undefined
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
    isMine: boolean
    isReported: boolean
    isBlocked: boolean
    finalAction: VoteAction | null
    votedNonce: number | null
    votedEpoch: number | null
    status: PostStatus
}

// For fromat in profile/history
export interface PostHistoryMetaData {
    id: string
    epochKey: string
    publishedAt: number
    content: string
    voteSum: number
    date: string
    url: string
}

export enum RelayRawPostStatus {
    NOT_ON_CHAIN,
    ON_CHAIN,
    REPORTED,
    DISAGREED,
}

export interface RelayRawPost {
    cid: string | null | undefined
    _id: string
    postId: string
    epochKey: string
    publishedAt: string
    content: string
    voteSum: number
    transactionHash: string | undefined
    epoch: number
    upCount: number
    downCount: number
    status: RelayRawPostStatus
    commentCount: number
    votes: RelayRawVote[]
}
