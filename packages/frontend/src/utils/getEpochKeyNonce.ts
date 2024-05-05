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
    if (actionCount && actionCount <= NUM_EPOCH_KEY_NONCE_PER_EPOCH) {
        return actionCount - 1
    }

    return Math.floor(Math.random() * NUM_EPOCH_KEY_NONCE_PER_EPOCH)
}
