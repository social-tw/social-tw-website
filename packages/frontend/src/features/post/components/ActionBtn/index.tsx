import { ReactComponent as CloseIcon } from '@/assets/svg/close-w.svg'
import { ReactComponent as EllipsisIcon } from '@/assets/svg/ellipsis.svg'
import { useMediaQuery } from '@uidotdev/usehooks'
import { ReactEventHandler, cloneElement, useCallback, useState } from 'react'

interface ActionItem {
    label: string
    icon?: React.ReactElement
    disabled?: boolean
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
            <button
                className="flex items-center justify-center w-4 h-4"
                data-testid="action-btn"
                onClick={onClick}
            >
                <EllipsisIcon />
            </button>
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
                p-2
                top-[-3px]
                right-[-3px]
                w-[150px]`}
        >
            <CloseIcon
                className={`w-4 h-4 p-0.5 absolute cursor-pointer top-2 right-3 z-10 box-border`}
                onClick={onClose}
            />
            {items.map((item) => (
                <MenuItemFloat
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    disabled={item.disabled}
                    onClick={item.onClick}
                />
            ))}
        </div>
    )
}

function MenuItemFloat({
    icon,
    label,
    disabled = false,
    onClick = () => {},
}: ActionItem) {
    return (
        <button
            className="flex items-center w-full gap-1 px-2 py-2 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
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
                p-3
                flex
                flex-col
                items-stretch 
                rounded-t-3xl
                bg-[#363636]
                cursor-pointer`}
        >
            <CloseIcon
                className={`w-5 h-5 absolute cursor-pointer top-7 right-6 z-10`}
                onClick={onClose}
            />
            {items.map((item) => (
                <MenuItemBottom
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    disabled={item.disabled}
                    onClick={item.onClick}
                />
            ))}
        </div>
    )
}
function MenuItemBottom({
    icon,
    label,
    disabled = false,
    onClick = () => {},
}: ActionItem) {
    return (
        <button
            className="flex items-center gap-4 p-3 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
            onClick={onClick}
        >
            {icon && cloneElement(icon, { className: 'w-5 h-5' })} {label}
        </button>
    )
}
