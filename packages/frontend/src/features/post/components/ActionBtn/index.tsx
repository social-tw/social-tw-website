import { ReactComponent as CloseIcon } from '@/assets/svg/close-w.svg'
import { ReactComponent as EllipsisIcon } from '@/assets/svg/ellipsis.svg'
import { useMediaQuery } from '@uidotdev/usehooks'
import { ReactEventHandler, cloneElement, useCallback, useState } from 'react'

interface ActionItem {
    icon?: React.ReactElement
    label: string
    onClick?: () => void
}

interface ActionBtnProps {
    items?: ActionItem[]
}

export default function ActionBtn({ items = [] }: ActionBtnProps) {
    const [isOpen, setIsOpen] = useState(false)
    const openActionMenu = useCallback(() => setIsOpen(true), [])
    const closeActionMenu = useCallback(() => setIsOpen(false), [])

    const onClick: ReactEventHandler = (e) => {
        e.preventDefault()
        openActionMenu()
    }

    return (
        <div className="relative" onClick={(e) => e.preventDefault()}>
            <EllipsisIcon className="cursor-pointer" onClick={onClick} />
            <ActionMenu
                items={items}
                isOpen={isOpen}
                onClose={closeActionMenu}
            />
        </div>
    )
}

interface ActionMenuProps {
    items: ActionItem[]
    isOpen: boolean
    onClose: () => void
}
function ActionMenu({ items, isOpen, onClose }: ActionMenuProps) {
    const isStickOnBottom = useMediaQuery('only screen and (max-width : 768px)')
    return (
        <>
            {!isOpen && null}
            {isOpen && !isStickOnBottom && (
                <ActionMenuFloat items={items} onClose={onClose} />
            )}
            {isOpen && isStickOnBottom && (
                <ActionMenuBottom items={items} onClose={onClose} />
            )}
        </>
    )
}

interface ActionMenuFloatProps {
    items: ActionItem[]
    onClose: () => void
}
function ActionMenuFloat({ items, onClose }: ActionMenuFloatProps) {
    return (
        <div
            className={`
                absolute
                bg-[#363636]
                rounded-[8px]
                px-4
                py-3
                top-[-3px]
                right-[-3px]
                w-[150px]`}
        >
            <CloseIcon
                className={`w-3 h-3 absolute cursor-pointer top-2 right-3`}
                onClick={onClose}
            />
            {items.map((item) => (
                <MenuItemFloat
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    onClick={item.onClick}
                />
            ))}
        </div>
    )
}

function MenuItemFloat({ icon, label, onClick }: ActionItem) {
    return (
        <button
            className="flex items-center gap-1 text-white cursor-pointer"
            onClick={onClick}
        >
            {icon} {label}
        </button>
    )
}

interface ActionMenuBottomProps {
    items: ActionItem[]
    onClose: () => void
}
function ActionMenuBottom({ items, onClose }: ActionMenuBottomProps) {
    return (
        <div
            className={`
                fixed
                z-10 
                bottom-0 
                left-0
                w-screen 
                h-20
                px-6
                flex 
                items-stretch 
                rounded-t-3xl
                bg-[#363636]
                cursor-pointer`}
        >
            <CloseIcon
                className={`w-5 h-5 absolute cursor-pointer top-7 right-6`}
                onClick={onClose}
            />
            {items.map((item) => (
                <MenuItemBottom
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    onClick={item.onClick}
                />
            ))}
        </div>
    )
}
function MenuItemBottom({ icon, label, onClick }: ActionItem) {
    return (
        <div
            className="flex items-center gap-4 text-white cursor-pointer"
            onClick={onClick}
        >
            {icon && cloneElement(icon, { className: 'w-5 h-5' })} {label}
        </div>
    )
}
