import type { UserState } from '@/contexts/UserState'

export default function getNonceFromEpochKey(
    epoch: number,
    epochKey: string,
    userState: UserState,
) {
    const epochKeys = userState.getEpochKeys(epoch)
    if (!epochKeys || !Array.isArray(epochKeys)) return null

    for (const [key, index] of epochKeys.map((ek, index) => [ek, index])) {
        if (key.toString() === epochKey) {
            return index as number
        }
    }
}
