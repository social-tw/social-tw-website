import { shouldShowMask } from '@/utils/helpers/postMaskHelper'
import { useEffect, useState } from 'react'

export function useReportMask(
    isReported: boolean,
    userState: any,
    epoch: any,
    epochKey: any,
) {
    const [isShowReportMask, setIsShowReportMask] = useState(false)

    const updateIsShowReportMask = (isShow: boolean) => {
        setIsShowReportMask(isShow)
    }

    useEffect(() => {
        const isShow = shouldShowMask(isReported, userState, epoch, epochKey)
        setIsShowReportMask(isShow)
    }, [isReported, userState, epoch, epochKey])

    return { isShowReportMask, updateIsShowReportMask }
}
