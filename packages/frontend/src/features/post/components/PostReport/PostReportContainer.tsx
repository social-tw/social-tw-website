interface PostReportContainerProps {
    children: React.ReactNode
}

export function PostReportContainer({ children }: PostReportContainerProps) {
    return (
        <div className="px-6 py-12 md:px-12 flex flex-col gap-6">
            {children}
        </div>
    )
}
