import { ReactComponent as CloseIcon } from '@/assets/svg/close-w.svg'
import { useMediaQuery } from '@uidotdev/usehooks'
import { ReactElement, ReactNode, createElement } from 'react'

interface ActionMenuBottomSlideProps {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
}

interface ActionMenuBottomSlideItemProps {
    icon: ReactElement
    name: string
    onClick: () => void
}

interface BottomSlideItemIconProps {
    icon: ReactElement
}

export function ActionMenuBottomSlide({
    isOpen,
    onClose,
    children,
}: ActionMenuBottomSlideProps) {
    const isMobile = useMediaQuery('only screen and (max-width : 768px)')
    const isShowing = isOpen && isMobile
    const containerClassName = `fixed z-10 bottom-0 left-0 w-screen h-20 px-6 flex items-stretch rounded-t-3xl bg-[#363636] cursor-pointer`
    return isShowing ? (
        <div className={containerClassName}>
            <CloseIcon
                className={`w-5 h-5 absolute cursor-pointer top-7 right-6`}
                onClick={onClose}
            />
            {children}
        </div>
    ) : null
}

export function ActionMenuBottomSlideItem({
    icon,
    name,
    onClick,
}: ActionMenuBottomSlideItemProps) {
    return (
        <div
            className="flex items-center gap-4 cursor-pointer text-white"
            onClick={onClick}
        >
            <BottomSlideItemIcon icon={icon} />
            {name}
        </div>
    )
}

function BottomSlideItemIcon({ icon }: BottomSlideItemIconProps) {
    return createElement(icon.type, { className: 'w-5 h-5' })
}
