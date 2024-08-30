function SetDateBtn({ onClick, name }: { onClick: () => void; name: string }) {
    return (
        <button
            className={`rounded-[4px] text-black px-4 py-2 text-xs md:text-base bg-[white]`}
            onClick={onClick}
        >
            {name}
        </button>
    )
}

export function SetTodayBtn({ onClick }: { onClick: () => void }) {
    return <SetDateBtn name="今天" onClick={onClick} />
}

export function SetPast7DaysBtn({ onClick }: { onClick: () => void }) {
    return <SetDateBtn name="過去 7 天" onClick={onClick} />
}

export function SetPast30DaysBtn({ onClick }: { onClick: () => void }) {
    return <SetDateBtn name="過去 30 天" onClick={onClick} />
}
