import dayjs from 'dayjs'
import { Link, useNavigate } from 'react-router-dom'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    actionsSelector,
    ActionStatus,
    ActionType,
    useActionStore,
    type Action,
} from '@/features/core'

function getActionTypeLabel(type: ActionType) {
    const typeLabels = {
        [ActionType.Post]: '貼文',
        [ActionType.Comment]: '留言',
        [ActionType.DeleteComment]: '刪除留言',
    }
    return typeLabels[type]
}

function getActionLink(action: Action) {
    if (action.type === ActionType.Post) {
        if (action.status === ActionStatus.Success) {
            return `/posts/${action.data.postId}`
        } else {
            return `/?failedPostId=${action.id}`
        }
    }
    if (
        action.type === ActionType.Comment ||
        action.type === ActionType.DeleteComment
    ) {
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

function ActionLink({
    action,
    onClose,
}: {
    action: Action
    onClose: () => void
}) {
    const navigate = useNavigate()
    const link = getActionLink(action)

    if (action.status === ActionStatus.Pending) {
        return <span className="text-white">請稍候</span>
    }

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        onClose()
        navigate(link)
    }

    return (
        <Link
            className="underline text-secondary"
            to={link}
            onClick={handleClick}
        >
            前往查看
        </Link>
    )
}

const columnHelper = createColumnHelper<Action>()

const columns = (onClose: () => void) => [
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
        cell: (props) => (
            <ActionLink action={props.row.original} onClose={onClose} />
        ),
    }),
]

export default function ActionTable({ onClose }: { onClose: () => void }) {
    const data = useActionStore(actionsSelector)

    const table = useReactTable({
        data,
        columns: columns(onClose),
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="h-64 overflow-y-auto">
            <table className="w-full table-auto">
                <thead className="sticky top-0 bg-black/90">
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
            </table>
        </div>
    )
}
