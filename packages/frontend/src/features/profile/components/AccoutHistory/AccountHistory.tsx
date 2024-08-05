import { useDatePicker } from '@/features/shared'
import dayjs from 'dayjs'
import { useState } from 'react'
import SearchByDate from '../SearchByDate/SearchByDate'
import { CommentTable } from './CommentTable'
import { DatesLimitDialog } from './DatesLimitDialog'
import { PostTable } from './PostTable'
import { SearchTabs } from './SearchTabs'
import { VoteTable } from './VoteTable'

export default function AccountHistory() {
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

    const tabs = [
        { value: 'posts', label: '貼文' },
        { value: 'comments', label: '留言' },
        { value: 'votes', label: '讚/倒讚' },
    ]

    const [tab, setTab] = useState('posts')

    return (
        <div className="mb-8 space-y-8">
            <SearchTabs items={tabs} value={tab} onTabChange={setTab} />
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
            {tab === 'posts' && <PostTable fromToEpoch={fromToEpoch} />}
            {tab === 'comments' && <CommentTable fromToEpoch={fromToEpoch} />}
            {tab === 'votes' && <VoteTable fromToEpoch={fromToEpoch} />}
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
