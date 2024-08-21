import Downvote from '@/assets/img/downvote.png'
import Upvote from '@/assets/img/upvote.png'
import { VoteService } from '@/features/core'
import {
    BodyCellData,
    BodyCellType,
    FromToEpoch,
    HeaderCellData,
    TableBody,
    TableContainer,
    TableHeader,
} from '@/features/shared'
import { FetchVoteHistoryResponse } from '@/types/api'
import dayjs from 'dayjs'
import { useMyVoteHistory } from '../../hooks/useMyVoteHistory/useMyVoteHistory'

interface VoteTableProps {
    fromToEpoch: FromToEpoch
}

export function VoteTable({ fromToEpoch }: VoteTableProps) {
    const { isFetching, isFetched, data } = useMyVoteHistory(fromToEpoch)
    const headerData = getHeaderData()
    const bodyData = parseVoteHistoryToBodyData(data || [])

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
        { label: 'Type' },
        { label: 'Epoch Key' },
        { label: 'Link' },
    ]
}

function parseVoteHistoryToBodyData(
    data: FetchVoteHistoryResponse,
): BodyCellData[][] {
    return data.map((item) => {
        const imgSrc = VoteService.isUpVote(item) ? Upvote : Downvote
        const imgAlt = VoteService.isUpVote(item) ? 'Upvote' : 'Downvote'
        return [
            {
                type: BodyCellType.Text,
                content: formatVoteDate(item.publishedAt),
            },
            { type: BodyCellType.Img, src: imgSrc, alt: imgAlt },
            { type: BodyCellType.Text, content: item.epochKey },
            {
                type: BodyCellType.Link,
                content: '前往查看',
                url: generatePostLink(item.postId),
            },
        ]
    })
}

function formatVoteDate(date: string) {
    return dayjs(date).format('YYYY/MM/DD')
}

function generatePostLink(postId: string) {
    return `/posts/${postId}`
}
