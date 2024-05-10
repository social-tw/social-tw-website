import useActionCount from '@/hooks/useActionCount'
import { NUM_EPOCH_KEY_NONCE_PER_EPOCH } from '@/config'

export function randomNonce() {
    const actionCount = useActionCount()

    if (actionCount < NUM_EPOCH_KEY_NONCE_PER_EPOCH) {
        return actionCount
    }

    return Math.floor(Math.random() * NUM_EPOCH_KEY_NONCE_PER_EPOCH)
}

export function getEpochKeyNonce(actionCount?: number) {
    if (actionCount === undefined) return 0
    if (
        actionCount !== undefined &&
        actionCount < NUM_EPOCH_KEY_NONCE_PER_EPOCH
    ) {
        return actionCount
    }

    return Math.floor(Math.random() * NUM_EPOCH_KEY_NONCE_PER_EPOCH)
}
