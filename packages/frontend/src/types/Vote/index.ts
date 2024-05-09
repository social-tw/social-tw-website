import { VoteType } from '@/pages/Profile/History/types'

export enum VoteAction {
  UPVOTE,
  DOWNVOTE,
  CANCEL_UPVOTE,
  CANCEL_DOWNVOTE,
}

// For socket uses
export interface VoteMsg {
  postId: string
  epoch: number
  vote: VoteAction
}

// For fromat in profile/history
export class VoteHistoryMetaData {
  constructor(
      public epochKey: string,
      public publishedAt: number,
      // public content: string,
      public date: string,
      public url: string,
      public type: VoteType,
  ) {}
}

export interface RelayRawVote {
  postId: string
  epochKey: string
  epoch: number
  publishedAt: string
  _id: string
  upVote: number
  downVote: number
}