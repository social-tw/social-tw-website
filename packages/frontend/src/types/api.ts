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
    postId: string | undefined
    content: string
    publishedAt: string | number
    transactionHash: string | undefined
    cid: string | undefined
    epoch: number
    epochKey: string
    upCount: number
    downCount: number
    voteSum: number
    status: number
    commentCount: number
    votes: Vote[]
    _id: string
}

export type FetchPostsResponse = RelayRawPost[]

export interface FetchPostsByEpochKeysParams {
    epochKeys: bigint[]
}

export type FetchPostsByEpochKeysResponse = RelayRawPost[]

export interface RelayRawComment {
    _id: string
    epochKey: string
    publishedAt: number
    content: string
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
    publishedAt: number
    content: string
    voteSum: number
    type: RelayRawVoteType
}

export interface FetchVotesByEpochKeysParams {
    epochKeys: bigint[]
}

export type FetchVotesByEpochKeysResponse = RelayRawVote[]
