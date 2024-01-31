import { Vote } from './'

export enum Directions {
    Asc = 'asc',
    Desc = 'desc',
}

export enum SortKeys {
    PublishedAt = 'publishedAt',
    VoteSum = 'voteSum',
}

export interface RelayRawPost {
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
    votes: Vote[]
}

export type FetchPostsResponse = RelayRawPost[]

export interface FetchPostsByEpochKeysParams {
    epochKeys: bigint[]
}

export type FetchPostsByEpochKeysResponse = RelayRawPost[]

export interface RelayRawComment {
    _id: string
    postId: string
    commentId: string | undefined
    cid: string | undefined
    epochKey: string
    epoch: number
    content: string | undefined
    publishedAt: string
    transactionHash: string
    status: number
    voteSum: number
}

export interface FetchCommentsByEpochKeysParams {
    epochKeys: bigint[]
}

export type FetchCommentsByEpochKeysResponse = RelayRawComment[]

export enum RelayRawVoteType {
    Upvote = 'Upvote',
    Downvote = 'Downvote',
}

export interface RelayRawVote {
    _id: string
    epochKey: string
    publishedAt: string
    content: string
    voteSum: number
    type: RelayRawVoteType
}

export interface FetchVotesByEpochKeysParams {
    epochKeys: bigint[]
}

export type FetchVotesByEpochKeysResponse = RelayRawVote[]
