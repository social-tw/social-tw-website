import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid } from 'react-window'
import { Post } from '../DTO/Post'

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

interface BodyCellData {
    type: 'text' | 'link' | 'img'
    content: string
    url?: string
}

interface CellTextProps {
    content: string
}

interface CellLinkProps {
    content: string
    url?: string
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
            {type === 'text' && <BodyCellText content={data.content} />}
            {type === 'link' && (
                <BodyCellLink content={data.content} url={data.url} />
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
        <a href={url} target="_blank" className={`text-[#2F9CAF] underline`}>
            {content}
        </a>
    )
}

export function parsePostsToBodyData(posts: Post[]): BodyCellData[][] {
    return posts.map((post) => {
        return [
            { type: 'text', content: post.date },
            { type: 'text', content: post.content },
            { type: 'text', content: post.epochKey },
            { type: 'link', content: '前往查看', url: post.url },
        ]
    })
}
