import { isMyEpochKey } from './epochKey'

export function shouldShowMask(
    condition: boolean,
    userState: any,
    epoch: any,
    epochKey: any,
) {
    return !!condition && !isMyEpochKey(userState, epoch, epochKey)
}
