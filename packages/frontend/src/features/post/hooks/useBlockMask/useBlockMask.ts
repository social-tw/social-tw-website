import { shouldShowMask } from '@/utils/helpers/postMaskHelper'
import { useMemo } from 'react'

export function useBlockMask(
    isBlocked: boolean,
    userState: any,
    epoch: any,
    epochKey: any,
) {
    const isShowBlockMask = useMemo(() => {
        return shouldShowMask(isBlocked, userState, epoch, epochKey)
    }, [isBlocked, userState, epoch, epochKey])

    return { isShowBlockMask }
}
