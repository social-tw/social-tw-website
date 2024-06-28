import { UserState } from '@unirep/core'
import { poseidon2 } from 'poseidon-lite/poseidon2'

export function getAdjudicateNullifier(hashUserId: string | number | bigint, reportId: string) {
    return poseidon2([hashUserId, reportId])
}


export function isMyAdjudicateNullifier(userState: UserState, reportId: string, nullifier: string) {
    const myAdjudicateNullifier = getAdjudicateNullifier(userState.id.secret, reportId).toString()
    return myAdjudicateNullifier === nullifier
}
