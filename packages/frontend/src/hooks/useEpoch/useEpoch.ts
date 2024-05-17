import { useEffect, useMemo } from 'react'
import { useUserState } from '../useUserState/useUserState'
import { QueryKeys } from '@/constants/queryKeys'
import { useQuery } from '@tanstack/react-query'

const epochLength = 300

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
            return userState.sync.calcEpochRemainingTime()
        },
    })

    const isPending =
        isUserStatePending || isCurrentEpochPending || isRemainingTimePending

    const epochStartTime = useMemo(
        () =>
            currentEpoch && remainingTime
                ? Date.now() / 1000 - (epochLength - remainingTime)
                : 0,
        [currentEpoch, remainingTime],
    )
    const epochEndTime = useMemo(
        () =>
            currentEpoch && remainingTime
                ? Date.now() / 1000 + remainingTime
                : 0,
        [currentEpoch, remainingTime],
    )

    useEffect(() => {
        if (currentEpoch && remainingTime) {
            const timer = setTimeout(async () => {
                await refetchCurrentEpoch()
                await refetchRemainingTime()
            }, remainingTime)

            return () => {
                clearTimeout(timer)
            }
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
