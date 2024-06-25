interface PostReportStepLabelProps {
    title: string
    isRequired: boolean
}

interface ReportFormStepGroupProps {
    children: React.ReactNode
}

interface ReportFormStepContentProps {
    children: React.ReactNode
}

interface ReportFormStepErrorHintProps {
    msg: string
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

export function ReportFormStepContent({
    children,
}: ReportFormStepContentProps) {
    return <div className="relative">{children}</div>
}

export function ReportFormStepErrorHint({ msg }: ReportFormStepErrorHintProps) {
    return <div className="absolute text-red-500 text-[11px] left-2">{msg}</div>
}

export function ReportFormStepGroup({ children }: ReportFormStepGroupProps) {
    return <div className="flex flex-col gap-2">{children}</div>
}
