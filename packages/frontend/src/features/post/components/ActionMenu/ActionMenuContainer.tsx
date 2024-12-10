import { ReactComponent as EllipsisIcon } from '@/assets/svg/ellipsis.svg'
import { ReactNode, SyntheticEvent, useRef } from 'react'
import { useClickAway } from 'react-use'

interface ActionMenuContainerProps {
    onOpen: (e: SyntheticEvent) => void
    onClose: () => void
    disabled: boolean
    children: ReactNode
}

export function ActionMenuContainer({
    onOpen,
    onClose,
    disabled,
    children,
}: ActionMenuContainerProps) {
    const ref = useRef(null)
    useClickAway(ref, onClose)
    return (
        <div className="relative" onClick={(e) => e.preventDefault()} ref={ref}>
            <button
                onClick={onOpen}
                className="w-6 h-6 flex items-center justify-center"
                disabled={disabled}
            >
                <EllipsisIcon className="cursor-pointer" />
            </button>
            {children}
        </div>
    )
}
