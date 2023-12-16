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

export const TabFilter = () => {
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
        isFilterDateAscActive: isFilterLatestActive,
        isFilterDateDescActive: isFilterOldestActive,
        isFilterPopularityAscActive: isFilterPopularityActive,
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
                isActive={isFilterLatestActive}
            />
            <FilterButton
                onClick={setPostActiveFilterToDateDesc}
                title="由舊到新"
                isActive={isFilterOldestActive}
            />
            <FilterButton
                onClick={setPostActiveFilterToPopularityAsc}
                title="熱門程度"
                isActive={isFilterPopularityActive}
            />
        </div>
    )
}

function CommentFilter() {
    const {
        isFilterDateAscActive: isFilterLatestActive,
        isFilterDateDescActive: isFilterOldestActive,
        isFilterPopularityAscActive: isFilterPopularityActive,
    } = useProfileHistoryCommentActiveFilter()
    const setCommentActiveFilterToLatest = useProfileHistoryStore(
        (state) => state.setCommentActiveFilterToLatest,
    )
    const setCommentActiveFilterToOldest = useProfileHistoryStore(
        (state) => state.setCommentActiveFilterToOldest,
    )
    const setCommentActiveFilterToPopularity = useProfileHistoryStore(
        (state) => state.setCommentActiveFilterToPopularity,
    )
    return (
        <div className="flex mt-4 gap-4 justify-end">
            <FilterButton
                onClick={setCommentActiveFilterToLatest}
                title="由新到舊"
                isActive={isFilterLatestActive}
            />
            <FilterButton
                onClick={setCommentActiveFilterToOldest}
                title="由舊到新"
                isActive={isFilterOldestActive}
            />
            <FilterButton
                onClick={setCommentActiveFilterToPopularity}
                title="熱門程度"
                isActive={isFilterPopularityActive}
            />
        </div>
    )
}

function VoteFilter() {
    const {
        isFilterDateAscActive: isFilterLatestActive,
        isFilterDateDescActive: isFilterOldestActive,
    } = useProfileHistoryVoteActiveFilter()
    const setVoteActiveFilterToLatest = useProfileHistoryStore(
        (state) => state.setVoteActiveFilterToLatest,
    )
    const setVoteActiveFilterToOldest = useProfileHistoryStore(
        (state) => state.setVoteActiveFilterToOldest,
    )
    return (
        <div className="flex mt-4 gap-4 justify-end">
            <FilterButton
                onClick={setVoteActiveFilterToLatest}
                title="由新到舊"
                isActive={isFilterLatestActive}
            />
            <FilterButton
                onClick={setVoteActiveFilterToOldest}
                title="由舊到新"
                isActive={isFilterOldestActive}
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
