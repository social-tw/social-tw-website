export interface PostInfo {
    id: string
    epochKey: string
    content: string
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
}

export enum CommentStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    Deleted = 'deleted',
    Reported = 'reported'
}

export interface CommentInfo {
    id: string
    epochKey: string
    content: string
    publishedAt: Date
    status: CommentStatus
    isMine: boolean
}
