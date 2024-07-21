import { useUserState } from '@/features/core'
import { useCallback, useState } from 'react'
import {
    EpochDateService,
    FromToEpoch,
    InvalidFromToEpoch,
} from '../services/EpochDateService'

export function useDatePicker() {
    const { userState } = useUserState()
    const [startDate, setStartDate] = useState<undefined | Date>(undefined)
    const [endDate, setEndDate] = useState<undefined | Date>(undefined)
    const [isDateSelected, setIsDateSelected] = useState(false)
    const [fromToEpoch, setFromToEpoch] = useState<FromToEpoch>(
        new InvalidFromToEpoch(),
    )
    const updateFromToEpoch = useCallback(async () => {
        if (!userState) {
            setFromToEpoch(new InvalidFromToEpoch())
            return
        }
        setFromToEpoch(
            EpochDateService.createFromToEpochByDateRange(
                startDate,
                endDate,
                userState.sync,
            ),
        )
    }, [startDate, endDate, userState])
    const onChange = (dates: any) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
        setIsDateSelected(!!start && !!end)
    }
    const setToday = () => {
        const today = new Date()
        setStartDate(today)
        setEndDate(today)
        setIsDateSelected(true)
    }
    const setPast7Days = () => {
        const today = new Date()
        const past7Days = new Date(today.getTime())
        past7Days.setDate(today.getDate() - 7)
        setStartDate(past7Days)
        setEndDate(today)
        setIsDateSelected(true)
    }
    const setPast30Days = () => {
        const today = new Date()
        const past30Days = new Date(today.getTime())
        past30Days.setDate(today.getDate() - 30)
        setStartDate(past30Days)
        setEndDate(today)
        setIsDateSelected(true)
    }
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
    }
}
