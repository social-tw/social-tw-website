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
    direction: Directions
    sortKey: SortKeys
}

export interface RelayRawPost {
    publishedAt: string
    content: string
    epochKey: string
    _id: string
}

export type FetchPostsByEpochKeysResponse = RelayRawPost[]
