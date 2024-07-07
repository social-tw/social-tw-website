import { useState } from 'react'

export function useDatePicker() {
    const [startDate, setStartDate] = useState<undefined | Date>(undefined)
    const [endDate, setEndDate] = useState<undefined | Date>(undefined)
    const [isDateSelected, setIsDateSelected] = useState(false)
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
    }
}
