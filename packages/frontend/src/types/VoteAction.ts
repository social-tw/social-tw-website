export enum VoteAction {
    UPVOTE,
    DOWNVOTE,
    CANCEL_UPVOTE,
    CANCEL_DOWNVOTE,
}

export enum EventType {
    VOTE = 'VOTE',
    COMMENT = 'COMMENT',
}

export interface VoteMsg {
    postId: string
    epoch: number
    vote: VoteAction
}
