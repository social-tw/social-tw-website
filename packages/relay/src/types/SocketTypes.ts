import { VoteAction } from './VoteAction'

export enum RoomType {
    VOTE = 'VOTE',
    COMMENT = 'COMMENT',
}

export interface VoteMsg {
    postId: string
    vote: VoteAction
}
