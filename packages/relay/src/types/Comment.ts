export enum CommentStatus {
    NOT_ON_CHAIN,
    ON_CHAIN,
    DELETED,
    REPORTED,
    DISAGREED,
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
