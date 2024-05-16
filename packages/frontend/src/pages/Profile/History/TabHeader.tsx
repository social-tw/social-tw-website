import {
    useProfileHistoryActiveTab,
    useProfileHistoryStore,
} from './store/useProfileHistoryStore'

interface TabButtonProps {
    onClick: () => void
    title: string
    isActive: boolean
}

export default function TabHeader() {
    return (
        <div className="flex gap-4">
            <PostTabButton />
            <CommentTabButton />
            <VoteTabButton />
        </div>
    )
}

function PostTabButton() {
    const { isPostActive } = useProfileHistoryActiveTab()
    const setActiveTabToPost = useProfileHistoryStore(
        (state) => state.setActiveTabToPost,
    )
    return (
        <TabButton
            onClick={setActiveTabToPost}
            title="貼文"
            isActive={isPostActive}
        />
    )
}

function CommentTabButton() {
    const { isCommentActive } = useProfileHistoryActiveTab()
    const setActiveTabToComment = useProfileHistoryStore(
        (state) => state.setActiveTabToComment,
    )
    return (
        <TabButton
            onClick={setActiveTabToComment}
            title="留言"
            isActive={isCommentActive}
        />
    )
}

function VoteTabButton() {
    const { isVoteActive } = useProfileHistoryActiveTab()
    const setActiveTabToVote = useProfileHistoryStore(
        (state) => state.setActiveTabToVote,
    )
    return (
        <TabButton
            onClick={setActiveTabToVote}
            title="讚/倒讚"
            isActive={isVoteActive}
        />
    )
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
