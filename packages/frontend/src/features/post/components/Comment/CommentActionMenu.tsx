import { ReactComponent as BanIcon } from '@/assets/svg/ban.svg'
import {
    ActionMenuBottomSlide,
    ActionMenuBottomSlideItem,
    ActionMenuContainer,
    ActionMenuDropdown,
    ActionMenuDropdownItem,
    useActionMenu,
} from '../ActionMenu'

export function CommentActionMenu() {
    const { isOpen, onOpen, onClose } = useActionMenu()
    return (
        <ActionMenuContainer onOpen={onOpen}>
            <ActionMenuDropdown isOpen={isOpen} onClose={onClose}>
                <ActionMenuDropdownItem
                    icon={<BanIcon />}
                    name="檢舉留言"
                    onClick={() => {}} // TODO: trigger comment report dialog
                />
            </ActionMenuDropdown>
            <ActionMenuBottomSlide isOpen={isOpen} onClose={onClose}>
                <ActionMenuBottomSlideItem
                    icon={<BanIcon />}
                    name="檢舉留言"
                    onClick={() => {}} // TODO: trigger comment report dialog
                />
            </ActionMenuBottomSlide>
        </ActionMenuContainer>
    )
}
