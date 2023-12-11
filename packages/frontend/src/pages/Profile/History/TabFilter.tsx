export const TabFilter = () => {
    return (
        <div className="flex mt-4 gap-4 justify-end">
            <FilterButton onClick={() => {}} title="由新到舊" isActive={true} />
            <FilterButton
                onClick={() => {}}
                title="由舊到新"
                isActive={false}
            />
            <FilterButton
                onClick={() => {}}
                title="熱門程度"
                isActive={false}
            />
        </div>
    )
}

interface FilterButtonProps {
    onClick: () => void
    title: string
    isActive: boolean
}

function FilterButton({ onClick, title, isActive }: FilterButtonProps) {
    const titleStyle = getTitleStyle(isActive)
    return <div className={titleStyle}>{title}</div>
}

function getTitleStyle(isActive: boolean): string {
    const textColor = isActive ? 'text-[#FF892A]' : 'text-white/[0.6]'
    return `
    text-sm
    ${textColor}
    `
}
