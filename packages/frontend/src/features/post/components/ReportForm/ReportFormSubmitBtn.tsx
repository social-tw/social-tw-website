interface ReportFormSubmitBtnProps {
    onClick: () => void
}

export function ReportFormSubmitBtn({ onClick }: ReportFormSubmitBtnProps) {
    return (
        <button
            className="w-full rounded-[8px] bg-[#FF892A] text-white py-3"
            onClick={onClick}
        >
            送出檢舉
        </button>
    )
}
