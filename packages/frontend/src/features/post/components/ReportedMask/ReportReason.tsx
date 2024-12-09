interface ReportReasonProps {
    reason: string
}

export default function ReportReason({ reason }: ReportReasonProps) {
    return (
        <div className="flex flex-col">
            <h3 className="text-sm tracking-wide">被檢舉原因類別</h3>
            <p className="text-xs font-medium text-white/90 break-words whitespace-break-spaces max-w-[200px]">
                {reason}
            </p>
        </div>
    )
}
