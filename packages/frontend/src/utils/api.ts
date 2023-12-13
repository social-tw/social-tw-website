import { SERVER } from '../config'
import {
    FetchPostsByEpochKeysParams,
    FetchPostsByEpochKeysResponse,
} from '../types/api'

export async function fetchRelayConfig() {
    const res = await fetch(`${SERVER}/api/config`)
    return res.json()
}

export async function fetchLogin() {
    const res = await fetch(`${SERVER}/api/login`)
    return res.json()
    
export async function fetchPostsByEpochKeys({
    epochKeys,
    direction,
    sortKey,
}: FetchPostsByEpochKeysParams): Promise<FetchPostsByEpochKeysResponse> {
    const epks = epochKeys.map((key) => key.toString()).join('_')
    const res = await fetch(
        `${SERVER}/api/my-account/posts?epks=${epks}&direction=${direction}&sortKey=${sortKey}`
    )
    return res.json()
}
