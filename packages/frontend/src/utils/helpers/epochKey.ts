import { UserState } from '@unirep/core'

export function isMyEpochKey(userState: UserState, epochKey: string) {
    const currentEpoch = userState.sync.calcCurrentEpoch()
    const numEpochKeyNoncePerEpoch =
        userState.sync.settings.numEpochKeyNoncePerEpoch

    for (let epoch = 1; epoch < currentEpoch + 1; epoch++) {
        for (let nonce = 0; nonce < numEpochKeyNoncePerEpoch; nonce++) {
            const myEpochKey = userState.getEpochKeys(epoch, nonce).toString()

            if (myEpochKey === epochKey) {
                return true
            }
        }
    }
    return false
}
