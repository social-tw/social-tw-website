import {
    BodyCellType,
    TableBody,
    TableContainer,
    TableHeader,
    type BodyCellData,
    type HeaderCellData,
} from '@/features/shared'
import { ReactNode } from 'react'
import { SearchByDate } from '../SearchByDate'

export default function ReputationHistory() {
    return (
        <Wrapper>
            <SearchByDate />
            <ReputationTable />
        </Wrapper>
    )
}

function Wrapper({ children }: { children: ReactNode }) {
    return <div className={`mb-8 flex flex-col gap-8`}>{children}</div>
}

function ReputationTable() {
    const headerData = getHeaderData()
    const bodyData = getBodyData()
    return (
        <TableContainer>
            <TableHeader data={headerData} />
            <TableBody
                data={bodyData}
                noDataHint="此日期區間尚無紀錄，請另行查詢"
                isLoading={false}
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

function getBodyData(): BodyCellData[][] {
    return Array(0)
        .fill(0)
        .map(() => {
            return [
                { type: BodyCellType.Text, content: '2024/07/23' },
                { type: BodyCellType.Text, content: 'mock reason' },
                { type: BodyCellType.Text, content: 'mock epoch key' },
                { type: BodyCellType.Text, content: '+3' },
            ]
        })
}
