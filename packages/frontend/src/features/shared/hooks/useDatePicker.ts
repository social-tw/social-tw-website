import { useRelayConfig, useUserState } from '@/features/core'
import dayjs from 'dayjs'
import { useCallback, useMemo, useState } from 'react'
import {
    EpochDateService,
    FromToEpoch,
    InvalidFromToEpoch,
} from '../services/EpochDateService'

export function useDatePicker() {
    const { userState } = useUserState()
    const { data: config } = useRelayConfig()
    const [startDate, setStartDate] = useState<undefined | Date>(undefined)
    const [endDate, setEndDate] = useState<undefined | Date>(undefined)
    const [fromToEpoch, setFromToEpoch] = useState<FromToEpoch>(
        new InvalidFromToEpoch(),
    )

    // Calculate epochLength in milliseconds
    const epochLength = useMemo(() => {
        return config?.EPOCH_LENGTH ? config.EPOCH_LENGTH * 1000 : undefined
    }, [config])

    const updateFromToEpoch = useCallback(() => {
        if (!userState || !epochLength) {
            setFromToEpoch(new InvalidFromToEpoch())
            return
        }
        setFromToEpoch(
            EpochDateService.createFromToEpochByDateRange(
                startDate,
                endDate,
                userState.sync,
                epochLength,
            ),
        )
    }, [endDate, epochLength, startDate, userState])

    const onChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates
        setStartDate(start ? dayjs(start).startOf('day').toDate() : undefined)
        setEndDate(end ? dayjs(end).endOf('day').toDate() : undefined)
    }

    const setToday = () => {
        const now = dayjs()
        setStartDate(now.startOf('day').toDate())
        setEndDate(now.endOf('day').toDate())
    }

    const setPast7Days = () => {
        const today = dayjs()
        const past7Date = today.subtract(7, 'day')
        setStartDate(past7Date.startOf('day').toDate())
        setEndDate(today.endOf('day').toDate())
    }

    const setPast30Days = () => {
        const today = dayjs()
        const past30Date = today.subtract(30, 'day')
        setStartDate(past30Date.startOf('day').toDate())
        setEndDate(today.endOf('day').toDate())
    }

    const reset = () => {
        setStartDate(undefined)
        setEndDate(undefined)
    }

    const isDateSelected = !!startDate && !!endDate

    return {
        startDate,
        endDate,
        isDateSelected,
        onChange,
        setToday,
        setPast7Days,
        setPast30Days,
        fromToEpoch,
        updateFromToEpoch,
        reset,
    }
}
