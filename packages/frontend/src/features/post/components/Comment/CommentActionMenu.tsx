import { ReactComponent as BanIcon } from '@/assets/svg/ban.svg'
import { useReputationScore } from '@/features/reporting'
import { useDialog } from '@/features/shared'
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import { FaTrashCan } from 'react-icons/fa6'
import {
    ActionMenuBottomSlide,
    ActionMenuBottomSlideItem,
    ActionMenuContainer,
    ActionMenuDropdown,
    ActionMenuDropdownItem,
    useActionMenu,
} from '../ActionMenu'
import CommentDeleteDialog from '../CommentDeleteDialog/CommentDeleteDialog'
import { CommentReportDialog } from './CommentReportDialog'
import { useAuthStatus } from '@/features/auth'

interface CommentActionMenuProps {
    postId: string
    commentId: string
    onDelete: () => void
    canDelete: boolean
    canReport: boolean
}

export function CommentActionMenu({
    postId,
    commentId,
    onDelete,
    canDelete,
    canReport,
}: CommentActionMenuProps) {
    const { isLoggedIn } = useAuthStatus()

    const {
        isOpen: isActionMenuOpen,
        onOpen: onActionMenuOpen,
        onClose: onActionMenuClose,
    } = useActionMenu()
    const {
        isOpen: isReportDialogOpen,
        onOpen: onReportDialogOpen,
        onClose: onReportDialogClose,
    } = useDialog()
    const {
        isOpen: isDeleteDialogOpen,
        onOpen: onDeleteDialogOpen,
        onClose: onDeleteDialogClose,
    } = useDialog()

    const { isValidReputationScore } = useReputationScore()

    const handleReportComment = isValidReputationScore
        ? onReportDialogOpen
        : openForbidActionDialog

    const onReport = () => {
        if (!isLoggedIn) return
        handleReportComment()
    }

    return (
        <ActionMenuContainer
            onOpen={onActionMenuOpen}
            onClose={onActionMenuClose}
            disabled={!isLoggedIn}
        >
            <ActionMenuDropdown
                isOpen={isActionMenuOpen}
                onClose={onActionMenuClose}
            >
                <ActionMenuDropdownItem
                    icon={<FaTrashCan />}
                    name="刪除留言"
                    onClick={onDeleteDialogOpen}
                    disabled={!canDelete}
                />
                <ActionMenuDropdownItem
                    icon={<BanIcon />}
                    name="檢舉留言"
                    onClick={onReport}
                    disabled={!canReport}
                />
            </ActionMenuDropdown>
            <ActionMenuBottomSlide
                isOpen={isActionMenuOpen}
                onClose={onActionMenuClose}
            >
                <ActionMenuBottomSlideItem
                    icon={<FaTrashCan />}
                    name="刪除留言"
                    onClick={onDeleteDialogOpen}
                    disabled={!canDelete}
                />
                <ActionMenuBottomSlideItem
                    icon={<BanIcon />}
                    name="檢舉留言"
                    onClick={onReport}
                    disabled={!canReport}
                />
            </ActionMenuBottomSlide>
            <CommentReportDialog
                postId={postId}
                commentId={commentId}
                isOpen={isReportDialogOpen}
                onClose={onReportDialogClose}
            />
            <CommentDeleteDialog
                open={isDeleteDialogOpen}
                onClose={onDeleteDialogClose}
                onConfirm={() => {
                    onDelete()
                    onDeleteDialogClose()
                }}
            />
        </ActionMenuContainer>
    )
}
