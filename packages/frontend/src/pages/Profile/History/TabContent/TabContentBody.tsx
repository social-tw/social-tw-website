import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid } from 'react-window'

import { Link } from 'react-router-dom'

import Downvote from '../../../../assets/downvote.png'
import Upvote from '../../../../assets/upvote.png'
import { VoteService } from '../services/VoteService'
import { CommentHistoryMetaData } from '@/types/Comments'
import { PostHistoryMetaData } from '@/types/Post'
import { VoteHistoryMetaData } from '@/types/Vote'

interface TabContentBodyProps {
    isInit: boolean
    isLoading: boolean
    data: BodyCellData[][]
}

interface BodyCellProps {
    data: BodyCellData
    rowIndex: number
    columnIndex: number
    style: React.CSSProperties
}

enum BodyCellType {
    Text = 'Text',
    Link = 'Link',
    Img = 'Img',
}

interface BodyCellTextData {
    type: BodyCellType.Text
    content: string
}

interface BodyCellLinkData {
    type: BodyCellType.Link
    content: string
    url: string
}

interface BodyCellImgData {
    type: BodyCellType.Img
    src: string
    alt: string
}

type BodyCellData = BodyCellTextData | BodyCellLinkData | BodyCellImgData

interface CellTextProps {
    content: string
}

interface CellLinkProps {
    content: string
    url: string
}

interface CellImgProps {
    src: string
    alt: string
}

export function TabContentBody({
    data,
    isLoading,
    isInit,
}: TabContentBodyProps) {
    return (
        <div>
            {(!isInit || isLoading) && <Loading />}
            {isInit && data.length === 0 && <div>NO DATA</div>}
            {isInit && data.length > 0 && (
                <AutoSizer>
                    {({ height, width }: { height: number; width: number }) => {
                        const rowHeight = 35
                        const rowCount = data.length
                        const columnCount = data[0].length
                        const columnWidth = Math.floor(width / columnCount)
                        return (
                            <FixedSizeGrid
                                style={{ overflowX: 'hidden' }}
                                columnCount={columnCount}
                                columnWidth={columnWidth}
                                height={height}
                                rowCount={rowCount}
                                rowHeight={rowHeight}
                                width={width}
                            >
                                {({ rowIndex, columnIndex, style }) => (
                                    <BodyCell
                                        data={data[rowIndex][columnIndex]}
                                        rowIndex={rowIndex}
                                        columnIndex={columnIndex}
                                        style={style}
                                    />
                                )}
                            </FixedSizeGrid>
                        )
                    }}
                </AutoSizer>
            )}
        </div>
    )
}

function Loading() {
    return (
        <div className="grid gap-4 pt-6">
            <progress className="w-8/12 h-[16px] rounded-2xl progress bg-[#222222]" />
            <progress className="w-6/12 h-[16px] rounded-2xl progress bg-[#222222]" />
            <progress className="w-4/12 h-[16px] rounded-2xl progress bg-[#222222]" />
            <progress className="w-2/12 h-[16px] rounded-2xl progress bg-[#222222]" />
        </div>
    )
}

function BodyCell({ data, rowIndex, columnIndex, style }: BodyCellProps) {
    const type = data.type
    return (
        <div style={{ ...style, overflow: 'hidden', paddingRight: '20px' }}>
            {type === BodyCellType.Text && (
                <BodyCellText content={data.content} />
            )}
            {type === BodyCellType.Link && (
                <BodyCellLink content={data.content} url={data.url} />
            )}
            {type === BodyCellType.Img && (
                <BodyCellImg src={data.src} alt={data.alt} />
            )}
        </div>
    )
}

function BodyCellText({ content }: CellTextProps) {
    return (
        <div className={`text-ellipsis overflow-hidden whitespace-nowrap`}>
            {content}
        </div>
    )
}

function BodyCellLink({ content, url }: CellLinkProps) {
    return (
        <Link to={url} className={`text-[#2F9CAF] underline`}>
            {content}
        </Link>
    )
}

function BodyCellImg({ src, alt }: CellImgProps) {
    return <img className="w-5 h-5" src={src} alt={alt} />
}

export function parsePostsToBodyData(
    posts: PostHistoryMetaData[],
): BodyCellData[][] {
    return posts.map((post) => {
        return [
            { type: BodyCellType.Text, content: post.date },
            { type: BodyCellType.Text, content: post.content },
            { type: BodyCellType.Text, content: post.epochKey },
            { type: BodyCellType.Link, content: '前往查看', url: post.url },
        ]
    })
}

export function parseCommentsToBodyData(
    comments: CommentHistoryMetaData[],
): BodyCellData[][] {
    return comments.map((comment) => {
        return [
            { type: BodyCellType.Text, content: comment.date },
            { type: BodyCellType.Text, content: comment.content },
            { type: BodyCellType.Text, content: comment.epochKey },
            { type: BodyCellType.Link, content: '前往查看', url: comment.url },
        ]
    })
}

export function parseVotesToBodyData(
    votes: VoteHistoryMetaData[],
): BodyCellData[][] {
    const voteService = new VoteService()
    return votes.map((vote) => {
        const imgSrc = voteService.isUpvote(vote) ? Upvote : Downvote
        const imgAlt = voteService.isUpvote(vote) ? 'Upvote' : 'Downvote'
        return [
            { type: BodyCellType.Text, content: vote.date },
            // { type: BodyCellType.Text, content: vote.content },
            { type: BodyCellType.Img, src: imgSrc, alt: imgAlt },
            { type: BodyCellType.Text, content: vote.epochKey },
            { type: BodyCellType.Link, content: '前往查看', url: vote.url },
        ]
    })
}
