import { RelayRawComment } from './Comments'
import { RelayRawPost } from './Post'
import { RelayRawVote } from './Vote'

export enum Directions {
    Asc = 'asc',
    Desc = 'desc',
}

export enum SortKeys {
    PublishedAt = 'publishedAt',
    VoteSum = 'voteSum',
}

export type FetchReputationHistoryResponse = {
    score: number
    report: {
        reason: string
        reportorEpochKey: string
        reportAt: string
    }
}[]

export interface FetchRelayConfigResponse {
    UNIREP_ADDRESS: string
    APP_ADDRESS: string
    ETH_PROVIDER_URL: string
}

export type FetchPostsResponse = RelayRawPost[]

export interface FetchPostsByEpochKeysParams {
    epochKeys: bigint[]
}

export type FetchPostsByEpochKeysResponse = RelayRawPost[]

export interface FetchCommentsByEpochKeysParams {
    epochKeys: bigint[]
}

export type FetchCommentsByEpochKeysResponse = RelayRawComment[]

export interface FetchVotesByEpochKeysParams {
    epochKeys: bigint[]
}

export type FetchVotesByEpochKeysResponse = RelayRawVote[]

export interface FetchCounterResponse {
    counter: number
}

export interface RelayUserStateTransitionResponse {
    txHash: string
}

export interface RelayRequestDataResponse {
    txHash: string
}

export interface RelaySignUpResponse {
    status: 'success'
    txHash: string
}

export interface RelayCreatePostResponse {
    txHash: string
}

export interface RelayCreateCommentResponse {
    txHash: string
}

export interface RelayRemoveCommentResponse {
    txHash: string
}
