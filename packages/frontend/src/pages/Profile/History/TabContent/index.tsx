import { useEffect } from 'react'
import {
    useProfileHistory,
    useProfileHistoryActiveTab,
} from '../useProfileHistoryStore'
import { TabContentBody, parsePostsToBodyData } from './TabContentBody'
import {
    TabContentHeader,
    getCommentHeaderData,
    getPostHeaderData,
    getVoteHeaderData,
} from './TabContentHeader'

export const TabContent = () => {
    const { isPostActive, isCommentActive, isVoteActive } =
        useProfileHistoryActiveTab()
    return (
        <div>
            {isPostActive && <PostTabContent />}
            {isCommentActive && <CommentTabContent />}
            {isVoteActive && <VoteTabContent />}
        </div>
    )
}

function PostTabContent() {
    const { isPostsFetching, isPostsInit, posts, fetchPosts } =
        useProfileHistory((state) => ({
            isPostsFetching: state.posts.isFetching,
            isPostsInit: state.posts.isInit,
            posts: state.posts.data,
            fetchPosts: state.fetchPosts,
        }))

    const headerData = getPostHeaderData()
    const bodyData = parsePostsToBodyData(posts)

    useEffect(() => {
        if (!isPostsInit) {
            fetchPosts()
        }
    }, [isPostsInit, fetchPosts])

    return (
        <div className={`h-full grid grid-rows-[auto_1fr]`}>
            <TabContentHeader data={headerData} />
            <TabContentBody data={bodyData} isLoading={isPostsFetching} />
        </div>
    )
}

function CommentTabContent() {
    const headerData = getCommentHeaderData()
    const bodyData = [[]]
    return (
        <div className={`h-full grid grid-rows-[auto_1fr]`}>
            <TabContentHeader data={headerData} />
            <TabContentBody data={bodyData} isLoading={false} />
        </div>
    )
}

function VoteTabContent() {
    const headerData = getVoteHeaderData()
    const bodyData = [[]]
    return (
        <div className={`h-full grid grid-rows-[auto_1fr]`}>
            <TabContentHeader data={headerData} />
            <TabContentBody data={bodyData} isLoading={false} />
        </div>
    )
}
