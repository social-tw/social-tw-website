import { RelayRawComment } from '@/types/Comments'
import { stringifyBigInts } from '@unirep/utils'
import {
    UserStateTransitionProof,
    SignupProof,
    EpochKeyProof,
    EpochKeyLiteProof,
} from '@unirep/circuits'
import { SERVER } from '../constants/config'
import {
    Directions,
    FetchCommentsByEpochKeysParams,
    FetchCommentsByEpochKeysResponse,
    FetchPostsByEpochKeysParams,
    FetchPostsByEpochKeysResponse,
    FetchRelayConfigResponse,
    FetchVotesByEpochKeysParams,
    FetchVotesByEpochKeysResponse,
    SortKeys,
    RelayUserStateTransitionResponse,
    RelaySignUpResponse,
    RelayCreateCommentResponse,
    RelayRemoveCommentResponse,
    RelayCreatePostResponse,
    RelayRequestDataResponse,
    FetchCounterResponse,
} from '../types/api'
import { RelayRawPost } from '@/types/Post'
import { VoteAction } from '@/types/Vote'

export async function fetchRelayConfig(): Promise<FetchRelayConfigResponse> {
    const response = await fetch(`${SERVER}/api/config`)
    return response.json()
}

export async function fetchLogin() {
    const response = await fetch(`${SERVER}/api/login`)
    return response.json()
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
    const response = await fetch(
        `${SERVER}/api/my-account/posts?epks=${epks}&direction=${direction}&sortKey=${sortKey}`,
    )
    return response.json()
}

export async function fetchCommentsByEpochKeys({
    epochKeys,
}: FetchCommentsByEpochKeysParams): Promise<FetchCommentsByEpochKeysResponse> {
    const epks = epochKeys.map((key) => key.toString()).join('_')
    const direction = Directions.Asc
    const sortKey = SortKeys.PublishedAt
    const response = await fetch(
        `${SERVER}/api/my-account/comments?epks=${epks}&direction=${direction}&sortKey=${sortKey}`,
    )
    return response.json()
}

export async function fetchVotesByEpochKeys({
    epochKeys,
}: FetchVotesByEpochKeysParams): Promise<FetchVotesByEpochKeysResponse> {
    const epks = epochKeys.map((key) => key.toString()).join('_')
    const direction = Directions.Asc
    const sortKey = SortKeys.PublishedAt
    const response = await fetch(
        `${SERVER}/api/my-account/votes?epks=${epks}&direction=${direction}&sortKey=${sortKey}`,
    )
    return response.json()
}

export async function fetchCounter(
    epochKeys: string,
): Promise<FetchCounterResponse> {
    const params = new URLSearchParams()
    const epks = epochKeys.replaceAll(',', '_')
    params.append('epks', epks)

    const response = await fetch(`${SERVER}/api/counter?${params.toString()}`)
    return response.json()
}

export async function relayUserStateTransition(
    proof: UserStateTransitionProof,
): Promise<RelayUserStateTransitionResponse> {
    const response = await fetch(`${SERVER}/api/transition`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(
            stringifyBigInts({
                publicSignals: proof.publicSignals,
                proof: proof.proof,
            }),
        ),
    })
    return response.json()
}

export async function relayRequestData(
    proof: EpochKeyProof,
    reqData: Record<number, string | number>,
): Promise<RelayRequestDataResponse> {
    const response = await fetch(`${SERVER}/api/request`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(
            stringifyBigInts({
                publicSignals: proof.publicSignals,
                proof: proof.proof,
                reqData,
            }),
        ),
    })

    const data = await response.json()

    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}

export async function relaySignUp(
    proof: SignupProof,
    hashUserId: string,
    token: string,
    fromServer: boolean,
): Promise<RelaySignUpResponse> {
    const response = await fetch(`${SERVER}/api/signup`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(
            stringifyBigInts({
                publicSignals: proof.publicSignals,
                proof: proof.proof,
                hashUserId,
                token,
                fromServer,
            }),
        ),
    })

    const data = await response.json()

    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}

export async function relayCreatePost(
    proof: EpochKeyProof,
    content: string,
): Promise<RelayCreatePostResponse> {
    const response = await fetch(`${SERVER}/api/post`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(
            stringifyBigInts({
                publicSignals: proof.publicSignals,
                proof: proof.proof,
                content,
            }),
        ),
    })

    const data = await response.json()

    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}

export async function relayCreateComment(
    proof: EpochKeyProof,
    postId: string,
    content: string,
): Promise<RelayCreateCommentResponse> {
    const response = await fetch(`${SERVER}/api/comment`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(
            stringifyBigInts({
                publicSignals: proof.publicSignals,
                proof: proof.proof,
                postId,
                content,
            }),
        ),
    })
    const data = await response.json()

    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}

export async function relayRemoveComment(
    proof: EpochKeyLiteProof,
    postId: string,
    commentId: string,
): Promise<RelayRemoveCommentResponse> {
    const response = await fetch(`${SERVER}/api/comment`, {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(
            stringifyBigInts({
                publicSignals: proof.publicSignals,
                proof: proof.proof,
                postId,
                commentId,
            }),
        ),
    })

    const data = await response.json()

    if (!response.ok) {
        throw Error(data.error)
    }
    return data
}

export async function relayVote(
    proof: EpochKeyLiteProof,
    id: string,
    voteAction: VoteAction,
) {
    const response = await fetch(`${SERVER}/api/vote`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            stringifyBigInts({
                postId: id,
                voteAction,
                publicSignals: proof.publicSignals,
                proof: proof.proof,
            }),
        ),
    })

    const data = await response.json()

    if (!response.ok) {
        throw Error(`Vote failed with status: ${data}`)
    }
    return data
}
