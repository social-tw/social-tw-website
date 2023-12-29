import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import {
    actionsSelector,
    ActionStatus,
    ActionType,
    useActionStore,
} from '@/contexts/Actions'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

import type { Action } from '@/contexts/Actions'

export function getActionTypeLabel(type: ActionType) {
    const typeLabels = {
        [ActionType.Post]: '貼文',
        [ActionType.Comment]: '留言',
        [ActionType.DeleteComment]: '刪除留言',
    }
    return typeLabels[type]
}

export function getActionLink(action: Action) {
    // TODO: check the comment link to redirect
    if (action.type === ActionType.Post) {
        return `/posts/${action.data.id}`
    }
    if (action.type === ActionType.Comment) {
        return `/posts/${action.data.postId}#${action.data.commentId}`
    }
    return '#'
}

function getActionStatusLabel(status: ActionStatus) {
    const actionStatusLabels = {
        [ActionStatus.Pending]: (
            <progress className="w-full h-3 rounded-none progress progress-primary" />
        ),
        [ActionStatus.Success]: <span>存取交易成功！</span>,
        [ActionStatus.Failure]: (
            <span className="text-primary">存取交易失敗！</span>
        ),
    }
    return actionStatusLabels[status]
}

function ActionLink({ action }: { action: Action }) {
    const link = getActionLink(action)

    if (action.status === ActionStatus.Pending) {
        return <span className="text-white">請稍候</span>
    }

    return (
        <Link className="underline text-secondary" to={link}>
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
        cell: (info) => getActionTypeLabel(info.getValue()),
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => getActionStatusLabel(info.getValue()),
    }),
    columnHelper.display({
        id: 'link',
        header: 'Link',
        cell: (props) => <ActionLink action={props.row.original} />,
    }),
]

export default function ActionTable() {
    const data = useActionStore(actionsSelector)

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
                                              header.getContext(),
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
                                        cell.getContext(),
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
                                              header.getContext(),
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
