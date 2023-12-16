import { useEffect } from 'react'
import { useUser } from '../../../../contexts/User'
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
    const { isPostsFetching, isPostsInit, posts } = useProfileHistory(
        (state) => ({
            isPostsFetching: state.posts.isFetching,
            isPostsInit: state.posts.isInit,
            posts: state.posts.data,
        }),
    )
    const headerData = getPostHeaderData()
    const bodyData = parsePostsToBodyData(posts)
    useInitPostTabContent()
    return (
        <div className={`h-full grid grid-rows-[auto_1fr]`}>
            <TabContentHeader data={headerData} />
            <TabContentBody
                data={bodyData}
                isLoading={isPostsFetching}
                isInit={isPostsInit}
            />
        </div>
    )
}

function CommentTabContent() {
    const headerData = getCommentHeaderData()
    const bodyData = [[]]
    return (
        <div className={`h-full grid grid-rows-[auto_1fr]`}>
            <TabContentHeader data={headerData} />
            <TabContentBody data={bodyData} isLoading={false} isInit={false} />
        </div>
    )
}

function VoteTabContent() {
    const headerData = getVoteHeaderData()
    const bodyData = [[]]
    return (
        <div className={`h-full grid grid-rows-[auto_1fr]`}>
            <TabContentHeader data={headerData} />
            <TabContentBody data={bodyData} isLoading={false} isInit={false} />
        </div>
    )
}

function useInitPostTabContent() {
    const { userState } = useUser()
    const { isPostsInit, fetchPosts } = useProfileHistory((state) => ({
        isPostsInit: state.posts.isInit,
        fetchPosts: state.fetchPosts,
    }))

    useEffect(() => {
        if (!isPostsInit && userState) {
            fetchPosts(userState)
        }
    }, [isPostsInit, userState, fetchPosts])
}
