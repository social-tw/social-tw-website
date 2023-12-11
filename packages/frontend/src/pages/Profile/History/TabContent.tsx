import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid } from 'react-window'

export const TabContent = () => {
    const headerData = getHeaderData()
    const bodyData = getBodyData()
    return (
        <div className={`grid grid-rows-[auto_1fr]`}>
            <TabContentHeader data={headerData} />
            <TabContentBody data={bodyData} />
        </div>
    )
}

interface TabContentHeaderProps {
    data: HeaderCellData[]
}
function TabContentHeader({ data }: TabContentHeaderProps) {
    return (
        <div className={`py-2`}>
            <AutoSizer disableHeight>
                {({ width }) => {
                    const rowHeight = 35
                    const columnCount = data.length
                    const columnWidth = Math.floor(width / columnCount)
                    return (
                        <FixedSizeGrid
                            columnCount={columnCount}
                            columnWidth={columnWidth}
                            height={rowHeight}
                            rowCount={1}
                            rowHeight={rowHeight}
                            width={width}
                        >
                            {({ columnIndex, style }) => (
                                <HeaderCell
                                    data={data[columnIndex]}
                                    style={style}
                                />
                            )}
                        </FixedSizeGrid>
                    )
                }}
            </AutoSizer>
        </div>
    )
}

interface HeaderCellProps {
    data: HeaderCellData
    style: React.CSSProperties
}
function HeaderCell({ data, style }: HeaderCellProps) {
    return (
        <div
            style={{
                ...style,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {data.label}
        </div>
    )
}

interface HeaderCellData {
    label: string
}
function getHeaderData(): HeaderCellData[] {
    return [
        { label: 'Date' },
        { label: 'Content' },
        { label: 'Epoch Key' },
        { label: 'Link' },
    ]
}

interface TabContentBodyProps {
    data: BodyCellData[][]
}
function TabContentBody({ data }: TabContentBodyProps) {
    return (
        <div>
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
        </div>
    )
}

interface BodyCellProps {
    data: BodyCellData
    rowIndex: number
    columnIndex: number
    style: React.CSSProperties
}
function BodyCell({ data, rowIndex, columnIndex, style }: BodyCellProps) {
    const type = data.type
    return (
        <div style={{ ...style, overflow: 'hidden', paddingRight: '20px' }}>
            {type === 'text' && <CellText content={data.content} />}
            {type === 'link' && (
                <CellLink content={data.content} url={data.url} />
            )}
        </div>
    )
}

interface CellTextProps {
    content: string
}
function CellText({ content }: CellTextProps) {
    return (
        <div className={`text-ellipsis overflow-hidden whitespace-nowrap`}>
            {content}
        </div>
    )
}

interface CellLinkProps {
    content: string
    url?: string
}
function CellLink({ content, url }: CellLinkProps) {
    return (
        <a href={url} target="_blank" className={`text-[#2F9CAF] underline`}>
            {content}
        </a>
    )
}

interface BodyCellData {
    type: 'text' | 'link' | 'img'
    content: string
    url?: string
}
function getBodyData(): BodyCellData[][] {
    return Array(1000).fill([
        { type: 'text', content: '2023/08/21' },
        { type: 'text', content: '今晚烹飪義大利麵。今天的天氣真美。' },
        { type: 'text', content: '123123wLm864asf931fkaFsdDfaBvT' },
        { type: 'link', content: '前往查看', url: '#' },
    ])
}
