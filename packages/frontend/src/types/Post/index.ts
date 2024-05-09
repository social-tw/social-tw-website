import { RelayRawVote, VoteAction } from "../Vote"

export enum PostStatus {
  Pending = 'pending',
  Success = 'success',
  Failure = 'failure',
  Deleted = 'deleted',
  Reported = 'reported',
}

// For displaying in the main page components
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

// For fromat in profile/history
export class PostHistoryMetaData {
  constructor(
      public id: string,
      public epochKey: string,
      public publishedAt: number,
      public content: string,
      public voteSum: number,
      public date: string,
      public url: string,
  ) {}
}

export interface RelayRawPost {
  cid: string | null | undefined
  _id: string
  postId: string
  epochKey: string
  publishedAt: string
  content: string
  voteSum: number
  transactionHash: string | undefined
  epoch: number
  upCount: number
  downCount: number
  status: number
  commentCount: number
  votes: RelayRawVote[]
}

[
  [
      {
          "publishedAt": "1715237995106",
          "postId": "0",
          "transactionHash": "0x02be07726ef11ecc5138db432ad98180c1f06b8369018af5bd92f8bdd64171e7",
          "content": "test1",
          "cid": null,
          "epoch": 0,
          "epochKey": "16939957984175251047168846291954014749016792142926529973910737432646700428129",
          "upCount": 1,
          "downCount": 0,
          "voteSum": 0,
          "status": 1,
          "commentCount": 0,
          "_id": "xXleaK2IFV1FCsMf8la3K",
          "votes": [
              {
                  "publishedAt": "1715238606104",
                  "postId": "0",
                  "epochKey": "13404125503094648691427898094848951247764763170087434203954306073161909619754",
                  "epoch": 0,
                  "upVote": 1,
                  "downVote": 0,
                  "_id": "QK2AE5N0uGqzdDmq2sKk2"
              }
          ]
      }
  ]
]

// [
//   [
//       {
//           "publishedAt": "1715238606104",
//           "postId": "0",
//           "epochKey": "13404125503094648691427898094848951247764763170087434203954306073161909619754",
//           "epoch": 0,
//           "upVote": 1,
//           "downVote": 0,
//           "_id": "QK2AE5N0uGqzdDmq2sKk2",
//           "post": null
//       }
//   ]
// ]