import {
    useProfileHistory,
    useProfileHistoryActiveTab,
    useProfileHistoryCommentActiveFilter,
    useProfileHistoryPostActiveFilter,
    useProfileHistoryVoteActiveFilter,
} from './useProfileHistoryStore'

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
        isFilterLatestActive,
        isFilterOldestActive,
        isFilterPopularityActive,
    } = useProfileHistoryPostActiveFilter()
    const setPostActiveFilterToLatest = useProfileHistory(
        (state) => state.setPostActiveFilterToLatest
    )
    const setPostActiveFilterToOldest = useProfileHistory(
        (state) => state.setPostActiveFilterToOldest
    )
    const setPostActiveFilterToPopularity = useProfileHistory(
        (state) => state.setPostActiveFilterToPopularity
    )
    return (
        <div className="flex mt-4 gap-4 justify-end">
            <FilterButton
                onClick={setPostActiveFilterToLatest}
                title="由新到舊"
                isActive={isFilterLatestActive}
            />
            <FilterButton
                onClick={setPostActiveFilterToOldest}
                title="由舊到新"
                isActive={isFilterOldestActive}
            />
            <FilterButton
                onClick={setPostActiveFilterToPopularity}
                title="熱門程度"
                isActive={isFilterPopularityActive}
            />
        </div>
    )
}

function CommentFilter() {
    const {
        isFilterLatestActive,
        isFilterOldestActive,
        isFilterPopularityActive,
    } = useProfileHistoryCommentActiveFilter()
    const setCommentActiveFilterToLatest = useProfileHistory(
        (state) => state.setCommentActiveFilterToLatest
    )
    const setCommentActiveFilterToOldest = useProfileHistory(
        (state) => state.setCommentActiveFilterToOldest
    )
    const setCommentActiveFilterToPopularity = useProfileHistory(
        (state) => state.setCommentActiveFilterToPopularity
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
    const { isFilterLatestActive, isFilterOldestActive } =
        useProfileHistoryVoteActiveFilter()
    const setVoteActiveFilterToLatest = useProfileHistory(
        (state) => state.setVoteActiveFilterToLatest
    )
    const setVoteActiveFilterToOldest = useProfileHistory(
        (state) => state.setVoteActiveFilterToOldest
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
