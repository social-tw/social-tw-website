import { useState } from 'react'

export function useDatePicker() {
    const [startDate, setStartDate] = useState(undefined)
    const [endDate, setEndDate] = useState(undefined)
    const [isDateSelected, setIsDateSelected] = useState(false)
    const onChange = (dates: any) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
        setIsDateSelected(!!start && !!end)
    }
    return {
        startDate,
        endDate,
        isDateSelected,
        onChange,
    }
}
