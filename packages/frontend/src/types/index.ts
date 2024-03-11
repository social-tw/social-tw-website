export enum PostStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    Deleted = 'deleted',
    Reported = 'reported',
}

export interface PostInfo {
    id: string
    postId: string | undefined
    epochKey: string | undefined
    content: string | undefined
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
    isMine: boolean
    finalAction: VoteAction | null
    status: PostStatus
}

export interface Vote {
    postId: string
    epoch: number
    epochKey: string
    _id: string
    upVote: boolean
    downVote: boolean
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
    epochKey: string | undefined
    content: string | undefined
    transactionHash: string
    publishedAt: number | string
    status: CommentStatus
    isMine: boolean
}

export enum VoteAction {
    UPVOTE,
    DOWNVOTE,
    CANCEL_UPVOTE,
    CANCEL_DOWNVOTE,
}

export enum EventType {
    VOTE = 'VOTE',
    COMMENT = 'comment',
}

export interface VoteMsg {
    postId: string
    epoch: number
    vote: VoteAction
}

export interface CommentMsg {
    id: string
    postId: string
    content: string
    epochKey: string
    epoch: number
}
