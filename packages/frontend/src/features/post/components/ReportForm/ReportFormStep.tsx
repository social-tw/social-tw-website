interface PostReportStepLabelProps {
    title: string
    isRequired: boolean
}

interface ReportFormStepGroupProps {
    children: React.ReactNode
}

export function ReportFormStepLabel({
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

export function ReportFormStepGroup({ children }: ReportFormStepGroupProps) {
    return <div className="flex flex-col gap-2">{children}</div>
}
