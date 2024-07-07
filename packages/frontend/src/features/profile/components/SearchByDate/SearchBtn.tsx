import clsx from 'clsx'

interface SearchBtnProps {
    disabled: boolean
}

export default function SearchBtn({ disabled }: SearchBtnProps) {
    return (
        <button
            className={clsx(
                `rounded-[8px] text-white px-4 min-w-[80px]`,
                `bg-[#FF892A] disabled:bg-slate-700`,
            )}
            disabled={disabled}
        >
            查詢
        </button>
    )
}
