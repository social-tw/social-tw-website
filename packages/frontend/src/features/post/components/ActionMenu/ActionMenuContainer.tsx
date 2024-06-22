import { ReactComponent as EllipsisIcon } from '@/assets/svg/ellipsis.svg'
import React, { ReactNode } from 'react'

interface ActionMenuContainerProps {
    onOpen: (e: React.SyntheticEvent) => void
    children: ReactNode
}

export function ActionMenuContainer({
    onOpen,
    children,
}: ActionMenuContainerProps) {
    return (
        <div className="relative" onClick={(e) => e.preventDefault()}>
            <EllipsisIcon className="cursor-pointer" onClick={onOpen} />
            {children}
        </div>
    )
}
