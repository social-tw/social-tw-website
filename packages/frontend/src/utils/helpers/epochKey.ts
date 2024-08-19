import { UserState } from '@unirep/core'

const epochKeysCache = new Map<string, string>()

export function isMyEpochKey(
    userState: UserState,
    epoch: number,
    epochKey: string,
) {
    const numEpochKeyNoncePerEpoch =
        userState.sync.settings.numEpochKeyNoncePerEpoch

    for (let nonce = 0; nonce < numEpochKeyNoncePerEpoch; nonce++) {
        const cacheKey = `${userState.id.secret}.${epoch}.${nonce}`

        let myEpochKey: string | undefined = undefined
        if (epochKeysCache.has(cacheKey)) {
            myEpochKey = epochKeysCache.get(cacheKey)
        } else {
            myEpochKey = userState.getEpochKeys(epoch, nonce).toString()
            epochKeysCache.set(cacheKey, myEpochKey)
        }

        if (myEpochKey === epochKey) {
            return true
        }
    }

    return false
}
