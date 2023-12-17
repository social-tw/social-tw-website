import { VoteAction } from './VoteAction'

export interface PostInfo {
    _id: string
    epochKey: string
    content: string
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
    isMine: boolean
    finalAction: VoteAction | null
}

export interface Vote {
    postId: string
    epoch: number
    epochKey: string
    _id: string
    upVote: boolean
    downVote: boolean
}
