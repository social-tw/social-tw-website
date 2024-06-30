import { CommentDeleteDialog, CommentReportDialog } from '@/features/post'
import { Avatar } from '@/features/shared'
import { CommentStatus } from '@/types/Comments'
import formatDate from '@/utils/helpers/formatDate'
import { useMediaQuery } from '@uidotdev/usehooks'
import clsx from 'clsx'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { FaBan, FaTrashCan } from 'react-icons/fa6'
import ActionBtn from '../ActionBtn'

interface CommentProps {
    commentId?: string
    epochKey?: string
    content: string
    publishedAt: Date
    status: CommentStatus
    canDelete: boolean
    canReport: boolean
    onRepublish?: () => void
    onDelete?: () => void
}

export default function Comment({
    commentId,
    epochKey = nanoid(),
    content = '',
    publishedAt,
    status = CommentStatus.Success,
    canDelete = true,
    canReport = true,
    onRepublish = () => {},
    onDelete = () => {},
}: CommentProps) {
    const [isDeletingDialogOpen, setIsDeletingDialogOpen] = useState(false)
    const [isReporting, setIsReporting] = useState(false)

    const _onRepublish = async () => {
        onRepublish()
    }

    const _onDelete = async () => {
        setIsDeletingDialogOpen(false)
        onDelete()
    }

    const onCancelDelete = () => {
        setIsDeletingDialogOpen(false)
    }

    const onCancelReport = () => {
        setIsReporting(false)
    }

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    const menuItems = [
        ...(canDelete
            ? [
                  {
                      label: '刪除留言',
                      icon: <FaTrashCan size={isSmallDevice ? 22 : 14} />,
                      onClick: () => {
                          setIsDeletingDialogOpen(true)
                      },
                  },
              ]
            : []),
        ...(canReport
            ? [
                  {
                      label: '檢舉留言',
                      icon: (
                          <FaBan size={isSmallDevice ? 22 : 14} className="" />
                      ),
                      onClick: () => {
                          setIsReporting(true)
                      },
                  },
              ]
            : []),
    ]

    return (
        <>
            <article
                id={commentId}
                className={clsx(
                    'pt-4 pb-6 space-y-2',
                    status !== CommentStatus.Success && 'opacity-30',
                )}
            >
                <header className="grid grid-cols-[1fr_auto] items-center">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <Avatar name={epochKey} />
                            <span className="text-xs font-medium tracking-wide text-white">
                                {status === CommentStatus.Failure
                                    ? '存取失敗，請再嘗試留言'
                                    : formatDate(publishedAt)}
                            </span>
                        </div>
                        <ActionBtn items={menuItems} />
                    </div>
                </header>
                <p className="text-sm font-medium text-white">{content}</p>
            </article>
            {status === CommentStatus.Failure && (
                <div className="mb-6">
                    <button
                        className="h-10 border-2 btn btn-sm btn-outline btn-primary"
                        onClick={_onRepublish}
                    >
                        再次發佈這則留言
                    </button>
                </div>
            )}
            <CommentDeleteDialog
                open={isDeletingDialogOpen}
                onClose={onCancelDelete}
                onConfirm={() => _onDelete()}
            />
            <CommentReportDialog
                isOpen={isReporting}
                onClose={onCancelReport}
            />
        </>
    )
}
