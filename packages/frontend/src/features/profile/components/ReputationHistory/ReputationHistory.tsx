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
import { ReactNode } from 'react'
import { useReputationHistory } from '../../hooks/useReputationHistory/useReputationHistory'
import SearchByDate from '../SearchByDate/SearchByDate'

interface ReputationTableProps {
    fromToEpoch: FromToEpoch
}

export default function ReputationHistory() {
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
    } = useDatePicker()

    return (
        <Wrapper>
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
            <ReputationTable fromToEpoch={fromToEpoch} />
        </Wrapper>
    )
}

function Wrapper({ children }: { children: ReactNode }) {
    return <div className={`mb-8 flex flex-col gap-8`}>{children}</div>
}

function ReputationTable({ fromToEpoch }: ReputationTableProps) {
    const { isFetchingReputationHistory, reputationHistory } =
        useReputationHistory(fromToEpoch)
    const headerData = getHeaderData()
    const bodyData = parseReputationHistoryToBodyData(reputationHistory || [])
    return (
        <TableContainer>
            <TableHeader data={headerData} />
            <TableBody
                data={bodyData}
                noDataHint="此日期區間尚無紀錄，請另行查詢"
                isLoading={isFetchingReputationHistory}
                isInit={true}
            />
        </TableContainer>
    )
}

function getHeaderData(): HeaderCellData[] {
    return [
        { label: 'Date' },
        { label: 'Reason' },
        { label: 'Epoch Key' },
        { label: 'Point' },
    ]
}

function parseReputationHistoryToBodyData(
    reputationHistoryData: FetchReputationHistoryResponse,
): BodyCellData[][] {
    return reputationHistoryData.map((v) => {
        return [
            { type: BodyCellType.Text, content: v.report.reportAt },
            { type: BodyCellType.Text, content: v.report.reason },
            { type: BodyCellType.Text, content: v.report.reportorEpochKey },
            { type: BodyCellType.Text, content: v.score },
        ]
    })
}
