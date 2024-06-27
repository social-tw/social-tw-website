import { ReactComponent as BanIcon } from '@/assets/svg/ban.svg'
import { ReactComponent as CloseIcon } from '@/assets/svg/close-w.svg'
import { ReactComponent as EllipsisIcon } from '@/assets/svg/ellipsis.svg'
import { useMediaQuery } from '@uidotdev/usehooks'
import { ReactEventHandler, useCallback, useState } from 'react'

export default function ActionBtn() {
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
            <ActionMenu isOpen={isOpen} onClose={closeActionMenu} />
        </div>
    )
}

interface ActionMenuProps {
    isOpen: boolean
    onClose: () => void
}
function ActionMenu({ isOpen, onClose }: ActionMenuProps) {
    const isStickOnBottom = useMediaQuery('only screen and (max-width : 768px)')
    return (
        <>
            {!isOpen && null}
            {isOpen && !isStickOnBottom && (
                <ActionMenuFloat onClose={onClose} />
            )}
            {isOpen && isStickOnBottom && (
                <ActionMenuBottom onClose={onClose} />
            )}
        </>
    )
}

interface ActionMenuFloatProps {
    onClose: () => void
}
function ActionMenuFloat({ onClose }: ActionMenuFloatProps) {
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
            <MenuItemFloat />
        </div>
    )
}

function MenuItemFloat() {
    return (
        <div className="flex items-center gap-1 cursor-pointer text-white">
            <BanIcon /> 檢舉貼文
        </div>
    )
}

interface ActionMenuBottomProps {
    onClose: () => void
}
function ActionMenuBottom({ onClose }: ActionMenuBottomProps) {
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
            <MenuItemBottom />
        </div>
    )
}
function MenuItemBottom() {
    return (
        <div className="flex items-center gap-4 cursor-pointer text-white">
            <BanIcon className={`w-5 h-5`} /> 檢舉貼文
        </div>
    )
}
