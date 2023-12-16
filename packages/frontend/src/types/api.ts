export enum Directions {
    Asc = 'asc',
    Desc = 'desc',
}

export enum SortKeys {
    PublishedAt = 'publishedAt',
    VoteSum = 'voteSum',
}

export interface FetchPostsByEpochKeysParams {
    epochKeys: bigint[]
}

export interface RelayRawPost {
    _id: string
    epochKey: string
    publishedAt: number
    content: string
    voteSum: number
}

export type FetchPostsByEpochKeysResponse = RelayRawPost[]
