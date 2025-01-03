import { useAuthStatus } from '@/features/auth'
import { useDatePicker } from '@/features/shared'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSessionStorage } from 'react-use'
import SearchByDate from '../SearchByDate/SearchByDate'
import { CommentTable } from './CommentTable'
import { DatesLimitDialog } from './DatesLimitDialog'
import { PostTable } from './PostTable'
import { SearchTabs } from './SearchTabs'
import { VoteTable } from './VoteTable'

interface AccountHistoryFilters {
    type?: string
    startDate?: string
    endDate?: string
}

const ACCOUNT_HISTORY_FILTERS = 'account-history-filters'

const types = [
    { value: 'posts', label: '貼文' },
    { value: 'comments', label: '留言' },
    { value: 'votes', label: '讚/倒讚' },
]

export default function AccountHistory() {
    const [searchParams, setSearchParams] = useSearchParams()

    const [filters, setFilters] = useSessionStorage<AccountHistoryFilters>(
        ACCOUNT_HISTORY_FILTERS,
        {},
    )

    const type = filters.type ?? searchParams.get('type') ?? 'posts'

    const setType = (type: string) => {
        setSearchParams((prev) => ({ ...Object.fromEntries(prev), type }), {
            replace: true,
        })
    }

    const {
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
    } = useDatePicker()

    const shouldShow30DaysLimit =
        !!startDate && !!endDate && !isWithin30Days(startDate, endDate)

    const { isLoggedIn } = useAuthStatus()

    const [shouldInit, setShouldInit] = useState(true)

    useEffect(() => {
        if (startDate && endDate) {
            setSearchParams(
                (prev) => ({
                    ...Object.fromEntries(prev),
                    startDate: dayjs(startDate).format('YYYY-MM-DD'),
                    endDate: dayjs(endDate).format('YYYY-MM-DD'),
                }),
                { replace: true },
            )
        }
    }, [endDate, setSearchParams, startDate])

    useEffect(() => {
        if (searchParams.size > 0) {
            setFilters(Object.fromEntries(searchParams))
        }
    }, [searchParams, setFilters])

    useEffect(() => {
        if (!startDate && !endDate && filters.startDate && filters.endDate) {
            const startDate = dayjs(filters.startDate, 'YYYY-MM-DD').toDate()
            const endDate = dayjs(filters.endDate, 'YYYY-MM-DD').toDate()
            onChange([startDate, endDate])
            setShouldInit(true)
        }
    }, [
        endDate,
        filters.endDate,
        filters.startDate,
        onChange,
        startDate,
        updateFromToEpoch,
    ])

    useEffect(() => {
        if (isLoggedIn && shouldInit) {
            updateFromToEpoch()
            setShouldInit(false)
        }
    }, [isLoggedIn, shouldInit, updateFromToEpoch])

    return (
        <div className="mb-8 space-y-8">
            <SearchTabs items={types} value={type} onTabChange={setType} />
            <SearchByDate
                startDate={startDate}
                endDate={endDate}
                isDateSelected={isDateSelected}
                onChange={onChange}
                onClickSearch={updateFromToEpoch}
                setToday={setToday}
                setPast7Days={setPast7Days}
                setPast30Days={setPast30Days}
            />
            <DatesLimitDialog isOpen={shouldShow30DaysLimit} onClose={reset} />
            {type === 'posts' && <PostTable fromToEpoch={fromToEpoch} />}
            {type === 'comments' && <CommentTable fromToEpoch={fromToEpoch} />}
            {type === 'votes' && <VoteTable fromToEpoch={fromToEpoch} />}
        </div>
    )
}

function isWithin30Days(startDate: Date | null, endDate: Date | null) {
    if (!startDate || !endDate) return false
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    const daysDifference = end.diff(start, 'day')
    return daysDifference <= 30
}
