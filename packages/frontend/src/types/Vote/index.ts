export enum VoteType {
    Upvote = 'Upvote',
    Downvote = 'Downvote',
}

export enum VoteAction {
    UPVOTE,
    DOWNVOTE,
    CANCEL_UPVOTE,
    CANCEL_DOWNVOTE,
}

// For socket uses
export interface VoteMsg {
    postId: string
    epoch: number
    vote: VoteAction
}

// For fromat in profile/history
export interface VoteHistoryMetaData {
    epochKey: string
    publishedAt: number
    date: string
    url: string
    type: VoteType
}

export interface RelayRawVote {
    postId: string
    epochKey: string
    epoch: number
    publishedAt: string
    _id: string
    upVote: number
    downVote: number
}
