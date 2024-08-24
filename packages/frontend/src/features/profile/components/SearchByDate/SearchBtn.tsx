import clsx from 'clsx'

interface SearchBtnProps {
    disabled: boolean
    onClick: () => void
}

export default function SearchBtn({ disabled, onClick }: SearchBtnProps) {
    return (
        <button
            className={clsx(
                `rounded-[8px] text-white px-4 min-w-[80px] text-xs md:text-base`,
                `bg-[#FF892A] disabled:bg-slate-700`,
                `cursor-pointer disabled:cursor-not-allowed`,
            )}
            disabled={disabled}
            onClick={onClick}
        >
            查詢
        </button>
    )
}
