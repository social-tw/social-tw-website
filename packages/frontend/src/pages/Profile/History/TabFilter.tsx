import {
    useProfileHistoryActiveTab,
    useProfileHistoryCommentActiveFilter,
    useProfileHistoryPostActiveFilter,
    useProfileHistoryStore,
    useProfileHistoryVoteActiveFilter,
} from './store/useProfileHistoryStore'

interface FilterButtonProps {
    onClick: () => void
    title: string
    isActive: boolean
}

export default function TabFilter() {
    const { isPostActive, isCommentActive, isVoteActive } =
        useProfileHistoryActiveTab()
    return (
        <div>
            {isPostActive && <PostFilter />}
            {isCommentActive && <CommentFilter />}
            {isVoteActive && <VoteFilter />}
        </div>
    )
}

function PostFilter() {
    const {
        isFilterDateAscActive,
        isFilterDateDescActive,
        isFilterPopularityAscActive,
    } = useProfileHistoryPostActiveFilter()

    const {
        setPostActiveFilterToDateAsc,
        setPostActiveFilterToDateDesc,
        setPostActiveFilterToPopularityAsc,
    } = useProfileHistoryStore((state) => ({
        setPostActiveFilterToDateAsc: state.setPostActiveFilterToDateAsc,
        setPostActiveFilterToDateDesc: state.setPostActiveFilterToDateDesc,
        setPostActiveFilterToPopularityAsc:
            state.setPostActiveFilterToPopularityAsc,
    }))

    return (
        <div className="flex mt-4 gap-4 justify-end">
            <FilterButton
                onClick={setPostActiveFilterToDateAsc}
                title="由新到舊"
                isActive={isFilterDateAscActive}
            />
            <FilterButton
                onClick={setPostActiveFilterToDateDesc}
                title="由舊到新"
                isActive={isFilterDateDescActive}
            />
            <FilterButton
                onClick={setPostActiveFilterToPopularityAsc}
                title="熱門程度"
                isActive={isFilterPopularityAscActive}
            />
        </div>
    )
}

function CommentFilter() {
    const {
        isFilterDateAscActive,
        isFilterDateDescActive,
        isFilterPopularityAscActive,
    } = useProfileHistoryCommentActiveFilter()
    const {
        setCommentActiveFilterToDateAsc,
        setCommentActiveFilterToDateDesc,
        setCommentActiveFilterToPopularityAsc,
    } = useProfileHistoryStore((state) => ({
        setCommentActiveFilterToDateAsc: state.setCommentActiveFilterToDateAsc,
        setCommentActiveFilterToDateDesc:
            state.setCommentActiveFilterToDateDesc,
        setCommentActiveFilterToPopularityAsc:
            state.setCommentActiveFilterToPopularityAsc,
    }))
    return (
        <div className="flex mt-4 gap-4 justify-end">
            <FilterButton
                onClick={setCommentActiveFilterToDateAsc}
                title="由新到舊"
                isActive={isFilterDateAscActive}
            />
            <FilterButton
                onClick={setCommentActiveFilterToDateDesc}
                title="由舊到新"
                isActive={isFilterDateDescActive}
            />
            <FilterButton
                onClick={setCommentActiveFilterToPopularityAsc}
                title="熱門程度"
                isActive={isFilterPopularityAscActive}
            />
        </div>
    )
}

function VoteFilter() {
    const { isFilterDateAscActive, isFilterDateDescActive } =
        useProfileHistoryVoteActiveFilter()
    const { setVoteActiveFilterToDateAsc, setVoteActiveFilterToDateDesc } =
        useProfileHistoryStore((state) => ({
            setVoteActiveFilterToDateAsc: state.setVoteActiveFilterToDateAsc,
            setVoteActiveFilterToDateDesc: state.setVoteActiveFilterToDateDesc,
        }))
    return (
        <div className="flex mt-4 gap-4 justify-end">
            <FilterButton
                onClick={setVoteActiveFilterToDateAsc}
                title="由新到舊"
                isActive={isFilterDateAscActive}
            />
            <FilterButton
                onClick={setVoteActiveFilterToDateDesc}
                title="由舊到新"
                isActive={isFilterDateDescActive}
            />
        </div>
    )
}

function FilterButton({ onClick, title, isActive }: FilterButtonProps) {
    const titleStyle = getTitleStyle(isActive)
    return (
        <div onClick={onClick} className={titleStyle}>
            {title}
        </div>
    )
}

function getTitleStyle(isActive: boolean): string {
    const textColor = isActive ? 'text-[#FF892A]' : 'text-white/[0.6]'
    return `
    cursor-pointer
    text-sm
    ${textColor}
    `
}
