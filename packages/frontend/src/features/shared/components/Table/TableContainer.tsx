interface TableContainerProps {
    children: React.ReactNode
}

export function TableContainer({ children }: TableContainerProps) {
    return (
        <div className={`h-full min-h-[300px] grid grid-rows-[auto_1fr]`}>
            {children}
        </div>
    )
}
