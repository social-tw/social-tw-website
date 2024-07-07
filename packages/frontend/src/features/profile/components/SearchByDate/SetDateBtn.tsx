function SetDateBtn({ onClick, name }: { onClick: () => void; name: string }) {
    return (
        <button
            className={`rounded-[4px] text-black px-4 py-2 min-w-[80px] bg-[white]`}
            onClick={onClick}
        >
            {name}
        </button>
    )
}

export function SetTodayBtn() {
    return <SetDateBtn name="今天" onClick={() => alert('set today')} />
}

export function SetPast7DaysBtn() {
    return (
        <SetDateBtn name="過去 7 天" onClick={() => alert('set past 7 days')} />
    )
}

export function SetPast30DaysBtn() {
    return (
        <SetDateBtn
            name="過去 30 天"
            onClick={() => alert('set past 30 days')}
        />
    )
}
