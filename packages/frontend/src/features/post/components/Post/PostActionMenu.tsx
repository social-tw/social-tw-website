import { ReactComponent as BanIcon } from '@/assets/svg/ban.svg'
import { ReactEventHandler, useCallback, useState } from 'react'
import {
    ActionMenuBottomSlide,
    ActionMenuBottomSlideItem,
    ActionMenuContainer,
    ActionMenuDropdown,
    ActionMenuDropdownItem,
} from '../ActionMenu'

export function PostActionMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const openActionMenu = useCallback(() => setIsOpen(true), [])
    const closeActionMenu = useCallback(() => setIsOpen(false), [])

    const onClick: ReactEventHandler = (e) => {
        e.preventDefault()
        openActionMenu()
    }

    return (
        <ActionMenuContainer onOpen={onClick}>
            <ActionMenuDropdown isOpen={isOpen} onClose={closeActionMenu}>
                <ActionMenuDropdownItem icon={<BanIcon />} name="檢舉貼文" />
            </ActionMenuDropdown>
            <ActionMenuBottomSlide isOpen={isOpen} onClose={closeActionMenu}>
                <ActionMenuBottomSlideItem icon={<BanIcon />} name="檢舉貼文" />
            </ActionMenuBottomSlide>
        </ActionMenuContainer>
    )
}
