export enum PostStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    Deleted = 'deleted',
    Reported = 'reported',
}
/**
 * 改動策略: 
 * 先將所有api的初始型別統一起來
 * 再依照個別的型別與功能去區分以下型別
 * 1. Info: 可以直接作用於 page components 上的型別
 * 2. Other: 定義型別在特定的資料夾中，用於
 */

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
    publishedAt: string
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

export enum CommentStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
    Deleted = 'deleted',
    Reported = 'reported',
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
