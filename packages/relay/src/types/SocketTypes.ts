import { VoteAction } from './VoteAction'

export enum EventType {
    VOTE = 'VOTE',
    COMMENT = 'COMMENT',
}

export interface VoteMsg {
    postId: string
    epoch: number
    vote: VoteAction
}
