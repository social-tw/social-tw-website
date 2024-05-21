import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUserState } from '@/hooks/useUserState/useUserState'
import { QueryKeys } from '@/constants/queryKeys'

const epochLength = 300000 // 300000 ms

export function useEpoch() {
    const { isPending: isUserStatePending, userState } = useUserState()

    const {
        isPending: isCurrentEpochPending,
        data: currentEpoch,
        refetch: refetchCurrentEpoch,
    } = useQuery({
        queryKey: [QueryKeys.CurrentEpoch, userState?.id?.toString()],
        queryFn: async () => {
            if (!userState) {
                return null
            }
            return userState.sync.calcCurrentEpoch()
        },
        staleTime: epochLength,
    })

    const {
        isPending: isRemainingTimePending,
        data: remainingTime,
        refetch: refetchRemainingTime,
    } = useQuery({
        queryKey: [QueryKeys.EpochRemainingTime, userState?.id?.toString()],
        queryFn: async () => {
            if (!userState) {
                return null
            }
            const time = userState.sync.calcEpochRemainingTime()
            return time * 1000
        },
        staleTime: epochLength,
    })

    const isPending =
        isUserStatePending || isCurrentEpochPending || isRemainingTimePending

    const epochStartTime = useMemo(() => {
        if (isUndefined(currentEpoch) || isNull(currentEpoch) || !remainingTime) {
            return 0
        }
        return Date.now() - (epochLength - remainingTime)
    }, [currentEpoch, remainingTime])

    const epochEndTime = useMemo(() => {
        if (isUndefined(currentEpoch) || isNull(currentEpoch) || !remainingTime) {
            return 0
        }
        return Date.now() + remainingTime
    }, [currentEpoch, remainingTime])

    useEffect(() => {
        if (isUndefined(currentEpoch) || isNull(currentEpoch) || !remainingTime) {
            return
        }

        const timer = setTimeout(async () => {
            await refetchCurrentEpoch()
            await refetchRemainingTime()
        }, remainingTime)

        return () => {
            clearTimeout(timer)
        }
    }, [currentEpoch, refetchCurrentEpoch, refetchRemainingTime, remainingTime])

    return {
        isPending,
        currentEpoch,
        remainingTime,
        epochLength,
        epochStartTime,
        epochEndTime,
    }
}
