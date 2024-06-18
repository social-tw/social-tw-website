import { ReactComponent as BanIcon } from '@/assets/svg/ban.svg'
import { ReactComponent as CloseIcon } from '@/assets/svg/close-w.svg'
import { ReactComponent as EllipsisIcon } from '@/assets/svg/ellipsis.svg'
import { useMediaQuery } from '@uidotdev/usehooks'
import { ReactEventHandler, useCallback, useState } from 'react'

export default function PostReportBtn() {
    const [isOpen, setIsOpen] = useState(false)
    const openActionMenu = useCallback(() => setIsOpen(true), [])
    const closeActionMenu = useCallback(() => setIsOpen(false), [])

    const onClick: ReactEventHandler = (e) => {
        // TODO: update Post > Header structure to prevent using preventDefault
        e.preventDefault()
        openActionMenu()
    }

    return (
        <div className="relative" onClick={(e) => e.preventDefault()}>
            <EllipsisIcon className="cursor-pointer" onClick={onClick} />
            <ActionBtnList isOpen={isOpen} onClose={closeActionMenu} />
        </div>
    )
}

interface ActionBtnListProps {
    isOpen: boolean
    onClose: () => void
}
function ActionBtnList({ isOpen, onClose }: ActionBtnListProps) {
    const isStickOnBottom = useMediaQuery('only screen and (max-width : 768px)')
    return (
        <>
            {!isOpen && null}
            {isOpen && !isStickOnBottom && (
                <ActionBtnListMenu onClose={onClose} />
            )}
            {isOpen && isStickOnBottom && (
                <ActionBtnListBottomMenu onClose={onClose} />
            )}
        </>
    )
}

interface ActionBtnListMenuProps {
    onClose: () => void
}
function ActionBtnListMenu({ onClose }: ActionBtnListMenuProps) {
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
            <MenuItem />
        </div>
    )
}

function MenuItem() {
    return (
        <div className="flex items-center gap-1 cursor-pointer text-white">
            <BanIcon /> 檢舉貼文
        </div>
    )
}

interface ActionBtnListBottomMenuProps {
    onClose: () => void
}
function ActionBtnListBottomMenu({ onClose }: ActionBtnListBottomMenuProps) {
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
            <BottomMenuItem />
        </div>
    )
}
function BottomMenuItem() {
    return (
        <div className="flex items-center gap-4 cursor-pointer text-white">
            <BanIcon className={`w-5 h-5`} /> 檢舉貼文
        </div>
    )
}
