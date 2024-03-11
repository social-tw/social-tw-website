import useActionCount from '@/hooks/useActionCount'
import { NUM_EPOCH_KEY_NONCE_PER_EPOCH } from '@/config'

export default function randomNonce() {
    const actionCount = useActionCount()

    if (actionCount < NUM_EPOCH_KEY_NONCE_PER_EPOCH) {
        return actionCount
    }

    return Math.floor(Math.random() * NUM_EPOCH_KEY_NONCE_PER_EPOCH)
}
