import { isMyEpochKey } from './epochKey'

export function shouldShowMask(
    condition: boolean,
    userState: any,
    epoch: any,
    epochKey: any,
    isShowMask: boolean,
) {
    return (
        condition &&
        userState &&
        epoch &&
        epochKey &&
        !isMyEpochKey(userState, epoch, epochKey) &&
        isShowMask
    )
}
