export enum CommentStatus {
    NotOnChain = 0,
    OnChain = 1,
    Deleted = 2,
    Reported = 3,
}

export type Comment = {
    commentId: string | undefined
    postId: string
    content: string | undefined
    publishedAt: string
    transactionHash: string
    cid: string | undefined
    epoch: number
    epochKey: string
    status: number
}
