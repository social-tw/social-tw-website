export enum PostStatus {
    NotOnChain = 0,
    OnChain = 1,
    Reported = 2,
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
    status: number
    commentCount: number
    votes: any[]
    _id: string
}
