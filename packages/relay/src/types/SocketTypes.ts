export enum RoomType {
    VOTE = 'VOTE',
    COMMENT = 'COMMENT',
}

export interface VoteMsg {
    postId: string
    // TODO: change to VoteAction
    vote: number
}

export interface CommentMsg {
    id: string
    postId: string
    content: string
    epochKey: string
    epoch: number
}
