import { PATHS } from '@/constants/paths'
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
import { type RelayRawPost, RelayRawPostStatus } from '@/types/Post'
import dayjs from 'dayjs'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { Link } from 'react-router-dom'
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
        { label: '日期' },
        { label: '內容' },
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
        { label: '連結' },
    ]
}

function parsePostHistoryToBodyData(
    data: FetchPostHistoryResponse,
): BodyCellData[][] {
    return data.map((item) => {
        return [
            {
                type: BodyCellType.Text,
                content: formatPostDate(Number(item.publishedAt)),
            },
            { type: BodyCellType.Text, content: getPostContent(item) },
            { type: BodyCellType.Text, content: item.epochKey },
            {
                type: BodyCellType.Link,
                content: '前往查看',
                url: generatePostLink(item.postId),
            },
        ]
    })
}

function BeReportingContent() {
    return (
        <div className="p-0.5 rounded border-2 border-black text-white text-xs text-center font-bold bg-[linear-gradient(108.3deg,#0C3037_8.76%,#131313_51.1%,#502A0C_93.43%)]">
            被檢舉，審核中
        </div>
    )
}

function BeBlockedContent() {
    return (
        <div className="p-0.5 rounded border-2 border-black text-white text-xs text-center font-bold bg-[linear-gradient(108.3deg,#0C3037_8.76%,#131313_51.1%,#502A0C_93.43%)]">
            被檢舉，審核中
        </div>
    )
}

function getPostContent(post: RelayRawPost) {
    switch (post.status) {
        case RelayRawPostStatus.REPORTED: {
            return <BeReportingContent />
        }
        case RelayRawPostStatus.DISAGREED: {
            return <BeBlockedContent />
        }
        default: {
            return post.content
        }
    }
}

function formatPostDate(date: number) {
    return dayjs(date).format('YYYY/MM/DD')
}

function generatePostLink(postId: string) {
    return `/posts/${postId}`
}
