interface ReportReasonProps {
    reason: string
}

export default function ReportReason({ reason }: ReportReasonProps) {
    const maxLength = 60

    const displayReason =
        reason.length > maxLength ? `${reason.slice(0, maxLength)}...` : reason

    return (
        <div className="mt-2 max-w-full">
            <h3 className="text-sm tracking-wide">被檢舉原因類別</h3>
            <p className="text-xs font-medium text-white/90 text-wrap overflow-wrap break-word max-w-[300px]">
                {displayReason}
            </p>
        </div>
    )
}
