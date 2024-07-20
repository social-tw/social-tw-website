export enum CommentStatus {
    NOT_ON_CHAIN,
    ON_CHAIN,
    REPORTED,
    DISAGREED,
    DELETED,
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
    status: CommentStatus
}
