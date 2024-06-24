import { ReactComponent as BanIcon } from '@/assets/svg/ban.svg'
import { useDialog } from '@/features/shared'
import {
    ActionMenuBottomSlide,
    ActionMenuBottomSlideItem,
    ActionMenuContainer,
    ActionMenuDropdown,
    ActionMenuDropdownItem,
    useActionMenu,
} from '../ActionMenu'
import { PostReportDialog } from './PostReportDialog'

export function PostActionMenu() {
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

    return (
        <ActionMenuContainer onOpen={onActionMenuOpen}>
            <ActionMenuDropdown
                isOpen={isActionMenuOpen}
                onClose={onActionMenuClose}
            >
                <ActionMenuDropdownItem
                    icon={<BanIcon />}
                    name="檢舉貼文"
                    onClick={onReportDialogOpen}
                />
            </ActionMenuDropdown>
            <ActionMenuBottomSlide
                isOpen={isActionMenuOpen}
                onClose={onActionMenuClose}
            >
                <ActionMenuBottomSlideItem
                    icon={<BanIcon />}
                    name="檢舉貼文"
                    onClick={onReportDialogOpen}
                />
            </ActionMenuBottomSlide>
            <PostReportDialog
                isOpen={isReportDialogOpen}
                onClose={onReportDialogClose}
            />
        </ActionMenuContainer>
    )
}
