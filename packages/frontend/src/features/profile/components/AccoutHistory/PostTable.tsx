import {
    BodyCellData,
    BodyCellType,
    FromToEpoch,
    HeaderCellData,
    TableBody,
    TableContainer,
    TableHeader,
} from '@/features/shared'
import { FetchPostHistoryResponse } from '@/types/api'
import dayjs from 'dayjs'
import { useMyPostHistory } from '../../hooks/useMyPostHistory/useMyPostHistory'

interface PostTableProps {
    fromToEpoch: FromToEpoch
}

export function PostTable({ fromToEpoch }: PostTableProps) {
    const { isFetching, isFetched, data } = useMyPostHistory(fromToEpoch)
    const headerData = getHeaderData()
    const bodyData = parsePostHistoryToBodyData(data || [])

    if (!isFetched) {
        return null
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
        { label: 'Date' },
        { label: 'Content' },
        { label: 'Epoch Key' },
        { label: 'Link' },
    ]
}

function parsePostHistoryToBodyData(
    data: FetchPostHistoryResponse,
): BodyCellData[][] {
    return data.map((item) => {
        return [
            {
                type: BodyCellType.Text,
                content: formatPostDate(item.publishedAt),
            },
            { type: BodyCellType.Text, content: item.content },
            { type: BodyCellType.Text, content: item.epochKey },
            {
                type: BodyCellType.Link,
                content: '前往查看',
                url: generatePostLink(item.postId),
            },
        ]
    })
}

function formatPostDate(date: string) {
    return dayjs(date).format('YYYY/MM/DD')
}

function generatePostLink(postId: string) {
    return `/posts/${postId}`
}
