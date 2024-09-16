import { RelayRawComment } from './Comments'
import { RelayRawPost } from './Post'
import { RelayRawReputationHistory } from './Report'
import { RelayRawVote } from './Vote'

export enum Directions {
    Asc = 'asc',
    Desc = 'desc',
}

export enum SortKeys {
    PublishedAt = 'publishedAt',
    VoteSum = 'voteSum',
}

export interface FetchRelayConfigResponse {
    UNIREP_ADDRESS: string
    APP_ADDRESS: string
    ETH_PROVIDER_URL: string
}

export type FetchPostsResponse = RelayRawPost[]

export type FetchPostResponse = RelayRawPost

export type FetchPostHistoryResponse = RelayRawPost[]

export type FetchCommentHistoryResponse = RelayRawComment[]

export type FetchVoteHistoryResponse = RelayRawVote[]

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

export type FetchReputationHistoryResponse = RelayRawReputationHistory[]

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

export interface RelayCreateVoteResponse {
    txHash: string
}

export interface RelayCreateReportResponse {
    reportId: string
}
