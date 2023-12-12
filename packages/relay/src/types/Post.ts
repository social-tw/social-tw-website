export type Post = {
    postId: string | undefined
    content: string | undefined
    publishedAt: number
    transactionHash: string | undefined
    cid: string | undefined
    epoch: number
    epochKey: string
    upCount: number
    downCount: number
    voteSum: number
    status: number
    commentCount: number
}
