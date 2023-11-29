export type Comment = {
    commentId: string | undefined
    postId: string
    content: string | undefined
    publishedAt: number
    transactionHash: string
    cid: string | undefined
    epoch: number
    epochKey: string
    status: number
}
