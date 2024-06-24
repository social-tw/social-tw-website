import { ReactComponent as BanIcon } from '@/assets/svg/ban.svg'
import {
    ActionMenuBottomSlide,
    ActionMenuBottomSlideItem,
    ActionMenuContainer,
    ActionMenuDropdown,
    ActionMenuDropdownItem,
    useActionMenu,
} from '../ActionMenu'
import { PostReportDialog, useReportDialog } from '../PostReport'

export function PostActionMenu() {
    const { isOpen, onOpen, onClose } = useActionMenu()
    const {
        isOpen: isReportOpen,
        onOpen: onReportOpen,
        onClose: onReportClose,
    } = useReportDialog()

    return (
        <ActionMenuContainer onOpen={onOpen}>
            <ActionMenuDropdown isOpen={isOpen} onClose={onClose}>
                <ActionMenuDropdownItem
                    icon={<BanIcon />}
                    name="檢舉貼文"
                    onClick={onReportOpen}
                />
            </ActionMenuDropdown>
            <ActionMenuBottomSlide isOpen={isOpen} onClose={onClose}>
                <ActionMenuBottomSlideItem
                    icon={<BanIcon />}
                    name="檢舉貼文"
                    onClick={onReportOpen}
                />
            </ActionMenuBottomSlide>
            <PostReportDialog isOpen={isReportOpen} onClose={onReportClose} />
        </ActionMenuContainer>
    )
}
