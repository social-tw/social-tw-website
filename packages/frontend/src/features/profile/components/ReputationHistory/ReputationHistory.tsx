import { PATHS } from '@/constants/paths'
import { QueryKeys } from '@/constants/queryKeys'
import { useAuthStatus } from '@/features/auth'
import { useUserState } from '@/features/core'
import {
    BodyCellType,
    TableBody,
    TableContainer,
    TableHeader,
    type BodyCellData,
    type HeaderCellData,
} from '@/features/shared'
import { useDatePicker } from '@/features/shared/hooks/useDatePicker'
import { FromToEpoch } from '@/features/shared/services/EpochDateService'
import { FetchReputationHistoryResponse } from '@/types/api'
import { ReputationType } from '@/types/Report'
import { formatDateByEpoch } from '@/utils/helpers/formatDateByEpoch'
import { useQueryClient } from '@tanstack/react-query'
import { UserState } from '@unirep/core'
import dayjs from 'dayjs'
import { ReactNode, useEffect, useState } from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { Link, useSearchParams } from 'react-router-dom'
import { useSessionStorage } from 'react-use'
import { useMyReputationHistory } from '../../hooks/useMyReputationHistory/useMyReputationHistory'
import SearchByDate from '../SearchByDate/SearchByDate'
import { SearchDayLimitDialog } from './SearchDayLimitDialog'

interface ReputationTableProps {
    fromToEpoch: FromToEpoch
}

interface ReputationHistoryFilters {
    startDate?: string
    endDate?: string
}

const REPUTATION_HISTORY_FILTERS = 'reputation-history-filters'

export default function ReputationHistory() {
    const [searchParams, setSearchParams] = useSearchParams()

    const [filters, setFilters] = useSessionStorage<ReputationHistoryFilters>(
        REPUTATION_HISTORY_FILTERS,
        {},
    )

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

    const queryClient = useQueryClient()

    const onClickSearch = async () => {
        updateFromToEpoch()

        await queryClient.invalidateQueries({
            queryKey: [QueryKeys.ReputationHistory]
        })
    }

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
    }, [endDate, filters.endDate, filters.startDate, onChange, startDate])

    useEffect(() => {
        if (isLoggedIn && startDate && endDate && shouldInit) {
            updateFromToEpoch()
            setShouldInit(false)
        }
    }, [endDate, isLoggedIn, shouldInit, startDate, updateFromToEpoch])

    return (
        <Wrapper>
            <SearchByDate
                startDate={startDate}
                endDate={endDate}
                isDateSelected={isDateSelected}
                onChange={onChange}
                onClickSearch={onClickSearch}
                setToday={setToday}
                setPast7Days={setPast7Days}
                setPast30Days={setPast30Days}
            />
            <ReputationTable fromToEpoch={fromToEpoch} />
            <SearchDayLimitDialog
                isOpen={shouldShow30DaysLimit}
                onClose={reset}
            />
        </Wrapper>
    )
}

function Wrapper({ children }: { children: ReactNode }) {
    return <div className={`mb-8 flex flex-col gap-8`}>{children}</div>
}

function ReputationTable({ fromToEpoch }: ReputationTableProps) {
    const { userState } = useUserState()
    const { isFetching, isFetched, data } = useMyReputationHistory(fromToEpoch)
    const headerData = getHeaderData()
    const bodyData = parseReputationHistoryToBodyData(data || [], userState)

    if (!isFetched) {
        return <div className="min-h-[300px]" />
    }

    return (
        <TableContainer>
            <TableHeader data={headerData} />
            <TableBody
                data={bodyData}
                noDataHint="此日期區間尚無紀錄，請另行查詢"
                isLoading={isFetching}
                isInit={isFetched}
            />
        </TableContainer>
    )
}

function getHeaderData(): HeaderCellData[] {
    return [
        { label: '日期' },
        { label: '原因' },
        {
            label: (
                <div className="flex items-start gap-1">
                    <span>EpochKey</span>
                    <Link to={`${PATHS.ABOUT_US}?viewId=feature-epoch`}>
                        <AiOutlineQuestionCircle />
                    </Link>
                </div>
            ),
        },
        { label: '得分' },
    ]
}

function parseReputationHistoryToBodyData(
    reputationHistoryData: FetchReputationHistoryResponse,
    userState?: UserState | null | undefined,
): BodyCellData[][] {
    return reputationHistoryData.map((v) => {
        return [
            {
                type: BodyCellType.Text,
                content: userState ? formatDateByEpoch(userState, v.epoch) : '',
            },
            { type: BodyCellType.Text, content: getReputationTypeText(v.type) },
            { type: BodyCellType.Text, content: v.epochKey },
            {
                type: BodyCellType.Text,
                content: formatReputationScore(v.type, v.score),
            },
        ]
    })
}

function isWithin30Days(startDate: Date | null, endDate: Date | null) {
    if (!startDate || !endDate) return false
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    const daysDifference = end.diff(start, 'day')
    return daysDifference <= 30
}

function getReputationTypeText(type: ReputationType) {
    switch (type) {
        case ReputationType.REPORT_SUCCESS: {
            return '檢舉成功'
        }
        case ReputationType.REPORT_FAILURE: {
            return '檢舉失敗'
        }
        case ReputationType.BE_REPORTED: {
            return '被檢舉成功'
        }
        case ReputationType.ADJUDICATE: {
            return '協助檢舉判定'
        }
        case ReputationType.CHECK_IN: {
            return '登入'
        }
        default: {
            return ''
        }
    }
}

function formatReputationScore(type: ReputationType, score: number) {
    switch (type) {
        case ReputationType.ADJUDICATE:
        case ReputationType.REPORT_SUCCESS:
        case ReputationType.CHECK_IN: {
            return `+${score}`
        }
        case ReputationType.REPORT_FAILURE:
        case ReputationType.BE_REPORTED: {
            return `-${score}`
        }
        default: {
            return `${score}`
        }
    }
}
