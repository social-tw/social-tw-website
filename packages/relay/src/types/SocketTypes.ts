export enum RoomType {
    VOTE = 'VOTE',
    COMMENT = 'COMMENT',
}

export interface VoteMsg {
    postId: string
    // TODO: change to VoteAction
    vote: number
}
