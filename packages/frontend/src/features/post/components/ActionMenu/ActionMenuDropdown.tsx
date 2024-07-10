import { ReactComponent as CloseIcon } from '@/assets/svg/close-w.svg'
import { useMediaQuery } from '@uidotdev/usehooks'
import { ReactElement, ReactNode, createElement } from 'react'

interface ActionMenuDropdownProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
}

interface ActionMenuDropdownItemProps {
    icon: ReactElement
    name: string
    onClick: () => void
    disabled: boolean
}

interface DropdownItemIconProps {
    icon: ReactElement
}

export function ActionMenuDropdown({
    isOpen,
    onClose,
    children,
}: ActionMenuDropdownProps) {
    const isMobile = useMediaQuery('only screen and (max-width : 768px)')
    const isShowing = isOpen && !isMobile
    const containerClassName = `absolute bg-[#363636] rounded-[8px] px-4 py-3 top-[-3px] right-[-3px] w-[150px]`
    return isShowing ? (
        <div className={containerClassName}>
            <CloseIcon
                className={`w-3 h-3 absolute cursor-pointer top-2 right-3`}
                onClick={onClose}
            />
            {children}
        </div>
    ) : null
}

export function ActionMenuDropdownItem({
    icon,
    name,
    onClick,
    disabled,
}: ActionMenuDropdownItemProps) {
    const cursor = disabled ? 'cursor-not-allowed' : 'cursor-pointer'
    const opacity = disabled ? 'opacity-50' : 'opacity-100'
    const handleClick = disabled ? () => {} : onClick
    return (
        <button
            className={`flex items-center gap-1 text-white ${cursor} ${opacity}`}
            onClick={handleClick}
        >
            <DropdownItemIcon icon={icon} />
            {name}
        </button>
    )
}

function DropdownItemIcon({ icon }: DropdownItemIconProps) {
    return createElement(icon.type)
}
