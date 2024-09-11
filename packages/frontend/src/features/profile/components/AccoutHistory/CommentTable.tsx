import {
    BodyCellData,
    BodyCellType,
    FromToEpoch,
    HeaderCellData,
    TableBody,
    TableContainer,
    TableHeader,
} from '@/features/shared'
import { FetchCommentHistoryResponse } from '@/types/api'
import dayjs from 'dayjs'
import { useMyCommentHistory } from '../../hooks/useMyCommentHistory/useMyCommentHistory'

interface CommentTableProps {
    fromToEpoch: FromToEpoch
}

export function CommentTable({ fromToEpoch }: CommentTableProps) {
    const { isFetching, isFetched, data } = useMyCommentHistory(fromToEpoch)
    const headerData = getHeaderData()
    const bodyData = parseCommentHistoryToBodyData(data || [])

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

function parseCommentHistoryToBodyData(
    data: FetchCommentHistoryResponse,
): BodyCellData[][] {
    return data.map((item) => {
        return [
            {
                type: BodyCellType.Text,
                content: formatCommentDate(Number(item.publishedAt)),
            },
            { type: BodyCellType.Text, content: item.content },
            { type: BodyCellType.Text, content: item.epochKey },
            {
                type: BodyCellType.Link,
                content: '前往查看',
                url: generateCommentLink(item.postId, item.commentId),
            },
        ]
    })
}

function formatCommentDate(date: number) {
    return dayjs(date).format('YYYY/MM/DD')
}

function generateCommentLink(postId: string, commentId: string) {
    return `/posts/${postId}#${commentId}`
}
