interface PostReportStepLabelProps {
    title: string
    isRequired: boolean
}

interface PostReportStepGroupProps {
    children: React.ReactNode
}

export function PostReportStepLabel({
    title,
    isRequired,
}: PostReportStepLabelProps) {
    return (
        <div className="flex items-center gap-1">
            <div>{title}</div>
            <div className="text-red-500">{isRequired ? '*' : null}</div>
        </div>
    )
}

export function PostReportStepGroup({ children }: PostReportStepGroupProps) {
    return <div className="flex flex-col gap-2">{children}</div>
}
