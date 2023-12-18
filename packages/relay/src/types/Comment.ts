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
