export interface PostInfo {
    id: string
    epochKey: string
    content: string
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
}

export interface CommnetDataFromApi {
    commentId: string
    epochKey: string
    epoch: number
    content: string
    transactionHash: string
    publishedAt: number | string
}

export enum CommentStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    Deleted = 'deleted',
    Reported = 'reported',
}

export interface CommentInfo {
    commentId: string
    postId: string
    epoch: number
    epochKey?: string
    content: string
    transactionHash: string
    publishedAt: number | string
    status: CommentStatus
    isMine: boolean
}
