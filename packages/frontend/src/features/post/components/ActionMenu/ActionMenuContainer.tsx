import { ReactComponent as EllipsisIcon } from '@/assets/svg/ellipsis.svg'
import { ReactNode, SyntheticEvent, useRef } from 'react'
import { useClickAway } from 'react-use'

interface ActionMenuContainerProps {
    onOpen: (e: SyntheticEvent) => void
    onClose: () => void
    children: ReactNode
}

export function ActionMenuContainer({
    onOpen,
    onClose,
    children,
}: ActionMenuContainerProps) {
    const ref = useRef(null)
    useClickAway(ref, onClose)
    return (
        <div className="relative" onClick={(e) => e.preventDefault()} ref={ref}>
            <EllipsisIcon className="cursor-pointer" onClick={onOpen} />
            {children}
        </div>
    )
}
