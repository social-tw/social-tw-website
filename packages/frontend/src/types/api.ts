export enum Directions {
    Asc = 'asc',
    Desc = 'desc',
}

export enum SortKeys {
    PublishedAt = 'publishedAt',
    VoteSum = 'voteSum',
}

export interface FetchPostsByEpochKeysParams {
    epochKeys: BigInt[]
    direction: Directions
    sortKey: SortKeys
}

export interface RelayRawPost {
    date: string
    content: string
    epochKey: string
    url: string
}

export type FetchPostsByEpochKeysResponse = RelayRawPost[]
