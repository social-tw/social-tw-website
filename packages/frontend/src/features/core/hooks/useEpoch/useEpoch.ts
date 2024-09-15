import { QueryKeys } from '@/constants/queryKeys'
import { useRelayConfig, useUserState } from '@/features/core'
import { useQuery } from '@tanstack/react-query'
import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import { useEffect, useMemo } from 'react'

export function useEpoch() {
    const { isPending: isUserStatePending, userState } = useUserState()
    const { data: config, isPending: isConfigPending } = useRelayConfig()

    // Convert EPOCH_LENGTH from seconds to milliseconds
    const epochLength = useMemo(() => {
        return config?.EPOCH_LENGTH ? config.EPOCH_LENGTH * 1000 : undefined
    }, [config])

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
        enabled: !!epochLength,
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
        enabled: !!epochLength,
    })

    const isPending =
        isUserStatePending || isCurrentEpochPending || isRemainingTimePending || isConfigPending || !epochLength

    const epochStartTime = useMemo(() => {
        if (
            isUndefined(currentEpoch) ||
            isNull(currentEpoch) ||
            !remainingTime ||
            !epochLength
        ) {
            return 0
        }
        return Date.now() - (epochLength - remainingTime)
    }, [currentEpoch, remainingTime, epochLength])
    
    const epochEndTime = useMemo(() => {
        if (
            isUndefined(currentEpoch) ||
            isNull(currentEpoch) ||
            !remainingTime
        ) {
            return 0
        }
        return Date.now() + remainingTime
    }, [currentEpoch, remainingTime])

    useEffect(() => {
        if (
            isUndefined(currentEpoch) ||
            isNull(currentEpoch) ||
            !remainingTime ||
            !epochLength
        ) {
            return
        }

        refetchRemainingTime()

        const timer = setTimeout(async () => {
            await refetchCurrentEpoch()
            await refetchRemainingTime()
        }, remainingTime)

        return () => {
            clearTimeout(timer)
        }
    }, [currentEpoch, refetchCurrentEpoch, refetchRemainingTime, remainingTime, epochLength])

    return {
        isPending,
        currentEpoch,
        remainingTime,
        epochLength,
        epochStartTime,
        epochEndTime,
    }
}
