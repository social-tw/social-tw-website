export enum PostStatus {
    NOT_ON_CHAIN,
    ON_CHAIN,
    REPORTED,
    DISAGREED,
}

export type Post = {
    postId: string | undefined
    content: string | undefined
    publishedAt: string
    transactionHash: string | undefined
    cid: string | undefined
    epoch: number
    epochKey: string
    upCount: number
    downCount: number
    voteSum: number
    status: PostStatus
    commentCount: number
    votes: any[]
    _id: string
}
