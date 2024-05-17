import { RelayRawComment } from '@/types/Comments'
import { SERVER } from '../config'
import {
    Directions,
    FetchCommentsByEpochKeysParams,
    FetchCommentsByEpochKeysResponse,
    FetchPostsByEpochKeysParams,
    FetchPostsByEpochKeysResponse,
    FetchVotesByEpochKeysParams,
    FetchVotesByEpochKeysResponse,
    SortKeys,
} from '../types/api'
import { RelayRawPost } from '@/types/Post'

export async function fetchRelayConfig() {
    const res = await fetch(`${SERVER}/api/config`)
    return res.json()
}

export async function fetchLogin() {
    const res = await fetch(`${SERVER}/api/login`)
    return res.json()
}

export async function fetchCommentsByPostId(
    postId: string,
): Promise<RelayRawComment[]> {
    if (!postId) return []
    const queryParams = new URLSearchParams()
    queryParams.append('postId', postId)
    const res = await fetch(`${SERVER}/api/comment?${queryParams.toString()}`)
    return await res.json()
}

export async function fetchSinglePost(postId: string): Promise<RelayRawPost> {
    const res = await fetch(`${SERVER}/api/post/${postId}`)
    return res.json()
}

export async function fetchPostsByEpochKeys({
    epochKeys,
}: FetchPostsByEpochKeysParams): Promise<FetchPostsByEpochKeysResponse> {
    const epks = epochKeys.map((key) => key.toString()).join('_')
    const direction = Directions.Asc
    const sortKey = SortKeys.PublishedAt
    const res = await fetch(
        `${SERVER}/api/my-account/posts?epks=${epks}&direction=${direction}&sortKey=${sortKey}`,
    )
    return res.json()
}

export async function fetchCommentsByEpochKeys({
    epochKeys,
}: FetchCommentsByEpochKeysParams): Promise<FetchCommentsByEpochKeysResponse> {
    const epks = epochKeys.map((key) => key.toString()).join('_')
    const direction = Directions.Asc
    const sortKey = SortKeys.PublishedAt
    const res = await fetch(
        `${SERVER}/api/my-account/comments?epks=${epks}&direction=${direction}&sortKey=${sortKey}`,
    )
    return res.json()
}

export async function fetchVotesByEpochKeys({
    epochKeys,
}: FetchVotesByEpochKeysParams): Promise<FetchVotesByEpochKeysResponse> {
    const epks = epochKeys.map((key) => key.toString()).join('_')
    const direction = Directions.Asc
    const sortKey = SortKeys.PublishedAt
    const res = await fetch(
        `${SERVER}/api/my-account/votes?epks=${epks}&direction=${direction}&sortKey=${sortKey}`,
    )
    return res.json()
}
