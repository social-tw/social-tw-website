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
    commentId: string
    postId: string
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

export interface RelayRawVote {
    postId: string
    epochKey: string
    publishedAt: string
    content: string
    voteSum: number
    upVote: number
    downVote: number
}

export interface FetchVotesByEpochKeysParams {
    epochKeys: bigint[]
}

export type FetchVotesByEpochKeysResponse = RelayRawVote[]
