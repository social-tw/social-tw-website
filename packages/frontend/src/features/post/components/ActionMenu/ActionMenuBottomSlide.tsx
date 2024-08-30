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
    disabled: boolean
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
    const containerClassName = `fixed z-50 bottom-0 left-0 w-screen h-20 px-6 flex gap-6 items-stretch rounded-t-3xl bg-[#363636] cursor-pointer`
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
    disabled,
}: ActionMenuBottomSlideItemProps) {
    const cursor = disabled ? 'cursor-not-allowed' : 'cursor-pointer'
    const opacity = disabled ? 'opacity-50' : 'opacity-100'
    const handleClick = disabled ? () => {} : onClick
    return (
        <button
            className={`flex items-center gap-4 text-white ${cursor} ${opacity}`}
            onClick={handleClick}
        >
            <BottomSlideItemIcon icon={icon} />
            {name}
        </button>
    )
}

function BottomSlideItemIcon({ icon }: BottomSlideItemIconProps) {
    return createElement(icon.type, { className: 'w-5 h-5' })
}
