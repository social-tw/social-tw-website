import {
    actionsSelector,
    ActionStatus,
    ActionType,
    getActionMessage,
    useActionStore,
    type Action,
} from '@/features/core'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import { Link, useNavigate } from 'react-router-dom'

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
        [ActionStatus.Success]: <span>上鏈交易成功！</span>,
        [ActionStatus.Failure]: (
            <span className="text-primary">上鏈交易失敗！</span>
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

    if (
        action.type === ActionType.ReportComment ||
        action.type === ActionType.ReportPost ||
        action.type === ActionType.Adjudicate ||
        action.type === ActionType.CheckIn
    ) {
        return <span className="text-white">-</span>
    }

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
            className="font-light underline text-secondary"
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
        header: '時間',
        cell: (info) => dayjs(info.getValue()).format('HH:mm:ss'),
    }),
    columnHelper.accessor('type', {
        header: '操作',
        cell: (info) => getActionMessage(info.getValue()),
    }),
    columnHelper.accessor('status', {
        header: '上鏈交易狀態',
        cell: (info) => getActionStatusLabel(info.getValue()),
    }),
    columnHelper.display({
        id: 'link',
        header: '連結',
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
        <article className="space-y-5">
            <header>
                <h1 className="text-sm font-semibold tracking-wider text-center text-white/90">
                    當前 Epoch 上鏈交易紀錄
                </h1>
            </header>
            <section className="h-64 overflow-y-auto">
                <table className="w-full table-auto">
                    <thead className="sticky top-0">
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
                                                  header.column.columnDef
                                                      .header,
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
            </section>
        </article>
    )
}
