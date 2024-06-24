interface ReportFormCtnProps {
    children: React.ReactNode
}

export function ReportFormCtn({ children }: ReportFormCtnProps) {
    return (
        <div className="px-6 py-12 md:px-12 flex flex-col gap-6">
            {children}
        </div>
    )
}
