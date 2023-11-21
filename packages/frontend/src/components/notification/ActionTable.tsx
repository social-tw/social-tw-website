import dayjs from 'dayjs'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

enum ActionType {
    Post = 'post',
    Comment = 'comment',
}

enum ActionStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
}

type Action = {
    submittedAt: number
    type: ActionType
    status: ActionStatus
    id: string
    data?: Record<string, any>
}

const defaultData = [
    {
        submittedAt: Date.now(),
        type: ActionType.Post,
        status: ActionStatus.Pending,
        id: '1',
    },
    {
        submittedAt: Date.now(),
        type: ActionType.Comment,
        status: ActionStatus.Success,
        id: '1',
    },
    {
        submittedAt: Date.now(),
        type: ActionType.Comment,
        status: ActionStatus.Failure,
        id: '1',
    },
]

const ActionTypeLabels = {
    [ActionType.Post]: '貼文',
    [ActionType.Comment]: '留言',
}

const ActionStatusContent = {
    [ActionStatus.Pending]: (
        <progress className="w-full h-3 rounded-none progress progress-primary" />
    ),
    [ActionStatus.Success]: <span>存取交易成功！</span>,
    [ActionStatus.Failure]: (
        <span className="text-primary">存取交易失敗！</span>
    ),
}

function ActionLink({ action }: { action: Action }) {
    if (action.status === ActionStatus.Pending) {
        return <span>請稍候</span>
    }
    return (
        <Link
            className="underline text-secondary"
            to={`/posts/${action?.data?.postId}/#${action.id}`}
        >
            前往查看
        </Link>
    )
}

const columnHelper = createColumnHelper<Action>()

const columns = [
    columnHelper.accessor('submittedAt', {
        header: 'Time',
        cell: (info) => dayjs(info.getValue()).format('HH:mm:ss'),
    }),
    columnHelper.accessor('type', {
        header: 'Action',
        cell: (info) => ActionTypeLabels[info.getValue()],
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => ActionStatusContent[info.getValue()],
    }),
    columnHelper.display({
        id: 'link',
        header: 'Link',
        cell: (props) => <ActionLink action={props.row.original} />,
    }),
]

export default function ActionTable() {
    const [data, setData] = useState(() => [...defaultData])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="w-full overflow-auto">
            <table className="w-full table-auto">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-2 py-1 text-xs font-semibold text-left text-white/50"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="px-2 py-1 text-xs font-medium text-left text-white/90"
                                >
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    {table.getFooterGroups().map((footerGroup) => (
                        <tr key={footerGroup.id}>
                            {footerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.footer,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </tfoot>
            </table>
        </div>
    )
}
