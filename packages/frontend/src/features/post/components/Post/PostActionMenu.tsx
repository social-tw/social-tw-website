import { ReactComponent as BanIcon } from '@/assets/svg/ban.svg'
import { useReputationScore } from '@/features/reporting'
import { useDialog } from '@/features/shared'
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import {
    ActionMenuBottomSlide,
    ActionMenuBottomSlideItem,
    ActionMenuContainer,
    ActionMenuDropdown,
    ActionMenuDropdownItem,
    useActionMenu,
} from '../ActionMenu'
import { PostReportDialog } from './PostReportDialog'

interface PostActionMenuProps {
    postId: string
}

export function PostActionMenu({ postId }: PostActionMenuProps) {
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

    const { isValidReputationScore } = useReputationScore()
    const handleReportPost = isValidReputationScore
        ? onReportDialogOpen
        : openForbidActionDialog

    return (
        <ActionMenuContainer
            onOpen={onActionMenuOpen}
            onClose={onActionMenuClose}
        >
            <ActionMenuDropdown
                isOpen={isActionMenuOpen}
                onClose={onActionMenuClose}
            >
                <ActionMenuDropdownItem
                    icon={<BanIcon />}
                    name="檢舉貼文"
                    onClick={handleReportPost}
                    disabled={false}
                />
            </ActionMenuDropdown>
            <ActionMenuBottomSlide
                isOpen={isActionMenuOpen}
                onClose={onActionMenuClose}
            >
                <ActionMenuBottomSlideItem
                    icon={<BanIcon />}
                    name="檢舉貼文"
                    onClick={handleReportPost}
                    disabled={false}
                />
            </ActionMenuBottomSlide>
            <PostReportDialog
                postId={postId}
                isOpen={isReportDialogOpen}
                onClose={onReportDialogClose}
            />
        </ActionMenuContainer>
    )
}
