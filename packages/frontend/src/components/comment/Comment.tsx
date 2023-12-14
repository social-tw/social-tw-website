import clsx from 'clsx'
import { useRef, useState } from 'react'
import { FaBan, FaTrashCan } from 'react-icons/fa6'
import { FiMoreHorizontal } from 'react-icons/fi'
import Avatar from '@/components/common/Avatar'
import { removeActionByCommentId } from '@/contexts/Actions'
import useCreateComment from '@/hooks/useCreateComment'
import formatDate from '@/utils/formatDate'
import {
    ControlledMenu,
    MenuItem,
    useClick,
    useMenuState,
} from '@szhsin/react-menu'
import { useMediaQuery } from '@uidotdev/usehooks'
import { CommentInfo, CommentStatus } from '../../types'
import CommentDeleteDialog from './CommentDeleteDialog'
import CommentReportDialog from './CommentReportDialog'
import useDeleteComment from '@/hooks/useDeleteComments'

interface CommentProps extends CommentInfo {
    onCloseAnimation?: () => void
    onOpenAnimation?: () => void
    isLast?: boolean
}

export default function Comment({
    isLast,
    commentId,
    postId,
    epoch,
    epochKey = '',
    content = '',
    transactionHash = '',
    publishedAt,
    status = CommentStatus.Success,
    isMine = true,
    onCloseAnimation = () => {},
    onOpenAnimation = () => {},
}: CommentProps) {
    const [isDeletingDialogOpen, setIsDeletingDialogOpen] = useState(false)
    const [isReporting, setIsReporting] = useState(false)

    const { create: createCommnet, genProof: genCommentProof } =
        useCreateComment()
    const {
        remove: deleteComment,
        genProof: genDeleteProof,
        isDeleted: isDeleted,
    } = useDeleteComment()

    const onRepublish = async () => {
        removeActionByCommentId(commentId)
        onOpenAnimation()
        const { proof, epoch } = await genCommentProof(postId, content)
        onCloseAnimation()
        await createCommnet(proof, postId, content, epoch)
    }

    const onDelete = async () => {
        setIsDeletingDialogOpen(false)
        onOpenAnimation()
        const proof = await genDeleteProof(epoch, transactionHash)
        onCloseAnimation()
        await deleteComment(proof, epoch, transactionHash)
    }

    const onCancelDelete = () => {
        setIsDeletingDialogOpen(false)
    }

    const onCancelReport = () => {
        setIsReporting(false)
    }

    const menuButtonRef = useRef(null)
    const [menuState, toggleMenu] = useMenuState({ transition: true })
    const anchorProps = useClick(menuState.state, toggleMenu)

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')

    const menu = isMine
        ? [
              {
                  label: '刪除留言',
                  icon: <FaTrashCan size={isSmallDevice ? 22 : 14} />,
                  onClick: () => {
                      console.log('delete comment')
                      setIsDeletingDialogOpen(true)
                  },
              },
          ]
        : [
              {
                  label: '檢舉留言',
                  icon: <FaBan size={isSmallDevice ? 22 : 14} className="" />,
                  onClick: () => {
                      console.log('reporting comment')
                      setIsReporting(true)
                  },
              },
          ]

    if (isDeleted) return null

    return (
        <>
            <article
                id={commentId}
                className={clsx(
                    'pt-4 pb-6 space-y-2',
                    status !== CommentStatus.Success && 'opacity-30',
                    !isLast &&
                        status === CommentStatus.Success &&
                        'border-b border-neutral-600'
                )}
            >
                <header className="grid grid-cols-[1fr_auto] items-center">
                    <div className="flex items-center gap-5">
                        <Avatar name={epochKey} />
                        <span className="text-xs font-medium tracking-wide text-white">
                            {status === CommentStatus.Failure
                                ? '存取失敗，請再嘗試留言'
                                : formatDate(publishedAt)}
                        </span>
                    </div>
                    <div>
                        {status !== CommentStatus.Failure && (
                            <button
                                className="btn btn-circle btn-sm btn-ghost"
                                ref={menuButtonRef}
                                {...anchorProps}
                            >
                                <FiMoreHorizontal size={24} />
                            </button>
                        )}
                    </div>
                </header>
                <p className="text-sm font-medium text-white">{content}</p>
            </article>
            {status === CommentStatus.Failure && (
                <div className="mb-6">
                    <button
                        className="btn btn-sm btn-outline btn-primary border-2 h-10"
                        onClick={onRepublish}
                    >
                        再次發佈這則留言
                    </button>
                </div>
            )}
            <ControlledMenu
                {...menuState}
                anchorRef={isSmallDevice ? undefined : menuButtonRef}
                anchorPoint={
                    isSmallDevice ? { x: 0, y: window.innerHeight } : undefined
                }
                align="end"
                viewScroll="auto"
                menuClassName={clsx(
                    'menu w-screen bg-[#363636] md:w-36 rounded-box max-md:rounded-b-none p-0',
                    isSmallDevice && 'h-20'
                )}
                onClose={() => toggleMenu(false)}
                transition
                portal
            >
                {menu.map((item, i) => (
                    <MenuItem key={i} onClick={item.onClick}>
                        <div className="font-medium text-white max-md:p-6 md:flex md:justify-center">
                            {item.icon}
                            <span className="md:text-sm text-lg tracking-wider mt-[2px]">
                                {item.label}
                            </span>
                        </div>
                    </MenuItem>
                ))}
            </ControlledMenu>
            <CommentDeleteDialog
                open={isDeletingDialogOpen}
                onClose={onCancelDelete}
                onConfirm={() => onDelete()}
                commentId={commentId}
                epoch={epoch}
            />
            <CommentReportDialog
                isOpen={isReporting}
                onClose={onCancelReport}
            />
        </>
    )
}
