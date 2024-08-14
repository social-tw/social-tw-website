export enum VoteAction {
    UPVOTE,
    DOWNVOTE,
    CANCEL_UPVOTE,
    CANCEL_DOWNVOTE,
}

export interface Vote {
    postId: string
    epochKey: string
    epoch: number
    publishedAt: string
    _id: string
    upVote: number
    downVote: number
}
