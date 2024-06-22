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
}: ActionMenuDropdownItemProps) {
    return (
        <div className="flex items-center gap-1 cursor-pointer text-white">
            <DropdownItemIcon icon={icon} />
            {name}
        </div>
    )
}

function DropdownItemIcon({ icon }: DropdownItemIconProps) {
    return createElement(icon.type)
}
