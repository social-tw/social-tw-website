import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid } from 'react-window'

interface TabContentHeaderProps {
    data: HeaderCellData[]
}

interface HeaderCellProps {
    data: HeaderCellData
    style: React.CSSProperties
}

interface HeaderCellData {
    label: string
}

export function TabContentHeader({ data }: TabContentHeaderProps) {
    return (
        <div className={`py-2`}>
            <AutoSizer disableHeight>
                {({ width }: { width: number }) => {
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

function HeaderCell({ data, style }: HeaderCellProps) {
    return (
        <div
            className="text-gray-400"
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

function getCommonHeaderData(): HeaderCellData[] {
    return [
        { label: 'Date' },
        { label: 'Content' },
        { label: 'Epoch Key' },
        { label: 'Link' },
    ]
}

export function getPostHeaderData(): HeaderCellData[] {
    return getCommonHeaderData()
}

export function getCommentHeaderData(): HeaderCellData[] {
    return getCommonHeaderData()
}

export function getVoteHeaderData(): HeaderCellData[] {
    return [
        { label: 'Date' },
        { label: 'Type' },
        { label: 'Epoch Key' },
        { label: 'Link' },
    ]
}
