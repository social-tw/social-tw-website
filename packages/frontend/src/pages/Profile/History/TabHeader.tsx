export const TabHeader = () => {
    return (
        <div className="flex gap-4">
            <TabButton onClick={() => {}} title="貼文" isActive={true} />
            <TabButton onClick={() => {}} title="留言" isActive={false} />
            <TabButton onClick={() => {}} title="讚/倒讚" isActive={false} />
        </div>
    )
}

interface TabButtonProps {
    onClick: () => void
    title: string
    isActive: boolean
}

function TabButton({ onClick, title, isActive }: TabButtonProps) {
    const buttonStyle = getTabButtonStyle(isActive)
    return (
        <button type="button" onClick={onClick} className={buttonStyle}>
            <span className={`font-semibold tracking-wider`}>{title}</span>
        </button>
    )
}

function getTabButtonStyle(isActive: boolean) {
    const bgColor = isActive ? 'bg-[#FF892A]' : 'bg-inherit'
    const textColor = isActive ? 'text-white' : 'text-[#FF892A]/[0.6]'
    const borderColor = isActive ? 'border-inherit' : 'border-[#FF892A]/[0.6]'
    const borderWidth = isActive ? 'border-0' : 'border-2'
    return `
    flex
    justify-center
    w-full
    max-w-[44rem]           
    items-center
    rounded-xl
    p-2
    transition 
    focus:outline-offset-0
    bg-opacity-70
    duration-300 
    ease-in-out
    ${bgColor} 
    ${textColor}
    ${borderWidth}
    ${borderColor}
    `
}
