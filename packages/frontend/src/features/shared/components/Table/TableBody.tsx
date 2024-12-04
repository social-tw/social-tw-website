import { Link } from 'react-router-dom'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid } from 'react-window'

interface TableBodyProps {
    isInit: boolean
    isLoading: boolean
    data: BodyCellData[][]
    noDataHint: string
}

interface TableBodyNoDataProps {
    hint: string
}

export type BodyCellData = BodyCellTextData | BodyCellLinkData | BodyCellImgData

export enum BodyCellType {
    Text = 'Text',
    Link = 'Link',
    Img = 'Img',
}

interface BodyCellTextData {
    type: BodyCellType.Text
    content: React.ReactNode
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

interface BodyCellProps {
    data: BodyCellData
    rowIndex: number
    columnIndex: number
    style: React.CSSProperties
}

interface CellTextProps {
    content: React.ReactNode
}

interface CellLinkProps {
    content: string
    url: string
}

interface CellImgProps {
    src: string
    alt: string
}

export function TableBody({
    data,
    isLoading,
    isInit,
    noDataHint,
}: TableBodyProps) {
    return (
        <div>
            {isLoading && <TableBodyLoading />}
            {isInit && data.length === 0 && (
                <TableBodyNoData hint={noDataHint} />
            )}
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

function TableBodyLoading() {
    return (
        <div className="grid gap-4 pt-6">
            <progress className="w-8/12 h-[16px] rounded-2xl progress bg-[#222222]" />
            <progress className="w-6/12 h-[16px] rounded-2xl progress bg-[#222222]" />
            <progress className="w-4/12 h-[16px] rounded-2xl progress bg-[#222222]" />
            <progress className="w-2/12 h-[16px] rounded-2xl progress bg-[#222222]" />
        </div>
    )
}

function TableBodyNoData({ hint }: TableBodyNoDataProps) {
    return <div className={`text-gray-300 text-center pt-6`}>{hint}</div>
}

function BodyCell({ data, rowIndex, columnIndex, style }: BodyCellProps) {
    const type = data.type
    return (
        <div style={{ ...style, overflow: 'hidden', padding: '4px' }}>
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
        <div
            className={`text-ellipsis overflow-hidden whitespace-nowrap text-white text-sm`}
        >
            {content}
        </div>
    )
}

function BodyCellLink({ content, url }: CellLinkProps) {
    return (
        <Link to={url} className={`text-[#2F9CAF] underline text-sm`}>
            {content}
        </Link>
    )
}

function BodyCellImg({ src, alt }: CellImgProps) {
    return <img className="w-5 h-5" src={src} alt={alt} />
}
