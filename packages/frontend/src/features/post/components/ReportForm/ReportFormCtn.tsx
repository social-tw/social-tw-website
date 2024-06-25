interface ReportFormCtnProps {
    children: React.ReactNode
    onSubmit: () => void
}

export function ReportFormCtn({ children, onSubmit }: ReportFormCtnProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="px-6 py-12 md:px-12 flex flex-col gap-6"
        >
            {children}
        </form>
    )
}
