interface ActionLinksProps {
    onClick: () => void
}

export default function ActionLinks({ onClick }: ActionLinksProps) {
    return (
        <nav className="flex gap-5 self-end text-right text-xs font-medium">
            <a href="/about" className="basis-auto underline">
                為什麼會有內容被檢舉？
            </a>
            <button className="underline" onClick={onClick}>
                查看屏蔽內容
            </button>
        </nav>
    )
}
