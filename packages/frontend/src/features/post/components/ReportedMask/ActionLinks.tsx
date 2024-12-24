interface ActionLinksProps {
    onClick: () => void
}

export default function ActionLinks({ onClick }: ActionLinksProps) {
    return (
        <nav className="flex self-end gap-5 py-3 text-xs font-medium text-right">
            <a
                href="/about?viewId=feature-community"
                className="underline basis-auto"
            >
                為什麼會有內容被檢舉？
            </a>
            <button className="underline" onClick={onClick}>
                查看屏蔽內容
            </button>
        </nav>
    )
}
