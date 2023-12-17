import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid } from 'react-window'

import { Link } from 'react-router-dom'

import Downvote from '../../../../assets/downvote.png'
import Upvote from '../../../../assets/upvote.png'
import { Comment } from '../DTO/Comment'
import { Post } from '../DTO/Post'
import { Vote } from '../DTO/Vote'
import { VoteService } from '../services/VoteService'

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
    TEXT = 'text',
    LINK = 'link',
    IMG = 'img',
}

interface BodyCellTextData {
    type: BodyCellType.TEXT
    content: string
}

interface BodyCellLinkData {
    type: BodyCellType.LINK
    content: string
    url: string
}

interface BodyCellImgData {
    type: BodyCellType.IMG
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
                    {({ height, width }) => {
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
            {type === BodyCellType.TEXT && (
                <BodyCellText content={data.content} />
            )}
            {type === BodyCellType.LINK && (
                <BodyCellLink content={data.content} url={data.url} />
            )}
            {type === BodyCellType.IMG && (
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

export function parsePostsToBodyData(posts: Post[]): BodyCellData[][] {
    return posts.map((post) => {
        return [
            { type: BodyCellType.TEXT, content: post.date },
            { type: BodyCellType.TEXT, content: post.content },
            { type: BodyCellType.TEXT, content: post.epochKey },
            { type: BodyCellType.LINK, content: '前往查看', url: post.url },
        ]
    })
}

export function parseCommentsToBodyData(comments: Comment[]): BodyCellData[][] {
    return comments.map((comment) => {
        return [
            { type: BodyCellType.TEXT, content: comment.date },
            { type: BodyCellType.TEXT, content: comment.content },
            { type: BodyCellType.TEXT, content: comment.epochKey },
            { type: BodyCellType.LINK, content: '前往查看', url: comment.url },
        ]
    })
}

export function parseVotesToBodyData(votes: Vote[]): BodyCellData[][] {
    const voteService = new VoteService()
    return votes.map((vote) => {
        const imgSrc = voteService.isUpvote(vote) ? Upvote : Downvote
        const imgAlt = voteService.isUpvote(vote) ? 'Upvote' : 'Downvote'
        return [
            { type: BodyCellType.TEXT, content: vote.date },
            { type: BodyCellType.TEXT, content: vote.content },
            { type: BodyCellType.IMG, src: imgSrc, alt: imgAlt },
            { type: BodyCellType.TEXT, content: vote.epochKey },
            { type: BodyCellType.LINK, content: '前往查看', url: vote.url },
        ]
    })
}
