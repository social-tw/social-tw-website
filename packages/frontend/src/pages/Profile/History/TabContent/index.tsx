import { UserState } from '@unirep/core'
import { useEffect } from 'react'
import {
    useProfileHistoryActiveTab,
    useProfileHistoryStore,
} from '../store/useProfileHistoryStore'
import {
    TabContentBody,
    parseCommentsToBodyData,
    parsePostsToBodyData,
    parseVotesToBodyData,
} from './TabContentBody'
import {
    TabContentHeader,
    getCommentHeaderData,
    getPostHeaderData,
    getVoteHeaderData,
} from './TabContentHeader'
import useUserState from '@/hooks/useUserState'

export default function TabContent() {
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
    const { isPostsFetching, isPostsInit, posts } = useProfileHistoryStore(
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
    const { isCommentsFetching, isCommentsInit, comments } =
        useProfileHistoryStore((state) => ({
            isCommentsFetching: state.comments.isFetching,
            isCommentsInit: state.comments.isInit,
            comments: state.comments.data,
        }))
    const headerData = getCommentHeaderData()
    const bodyData = parseCommentsToBodyData(comments)
    useInitCommentTabContent()
    return (
        <div className={`h-full grid grid-rows-[auto_1fr]`}>
            <TabContentHeader data={headerData} />
            <TabContentBody
                data={bodyData}
                isLoading={isCommentsFetching}
                isInit={isCommentsInit}
            />
        </div>
    )
}

function VoteTabContent() {
    const { isVotesFetching, isVotesInit, votes } = useProfileHistoryStore(
        (state) => ({
            isVotesFetching: state.votes.isFetching,
            isVotesInit: state.votes.isInit,
            votes: state.votes.data,
        }),
    )
    const headerData = getVoteHeaderData()
    const bodyData = parseVotesToBodyData(votes)
    useInitVoteTabContent()
    return (
        <div className={`h-full grid grid-rows-[auto_1fr]`}>
            <TabContentHeader data={headerData} />
            <TabContentBody
                data={bodyData}
                isLoading={isVotesFetching}
                isInit={isVotesInit}
            />
        </div>
    )
}

// TODO: decide to use UserState from @unirep/core or from src/contexts/Userstate.ts
function useInitPostTabContent() {
    const { userState } = useUserState()
    const { isHistoryPostsInit, invokeInitHistoryPostsFlow } =
        useProfileHistoryStore((state) => ({
            isHistoryPostsInit: state.posts.isInit,
            invokeInitHistoryPostsFlow: state.invokeInitHistoryPostsFlow,
        }))
    useEffect(() => {
        if (!isHistoryPostsInit && userState) {
            invokeInitHistoryPostsFlow(userState as unknown as UserState)
        }
    }, [isHistoryPostsInit, userState, invokeInitHistoryPostsFlow])
}

function useInitCommentTabContent() {
    const { userState } = useUserState()
    const { isHistoryCommentsInit, invokeInitHistoryCommentsFlow } =
        useProfileHistoryStore((state) => ({
            isHistoryCommentsInit: state.comments.isInit,
            invokeInitHistoryCommentsFlow: state.invokeInitHistoryCommentsFlow,
        }))
    useEffect(() => {
        if (!isHistoryCommentsInit && userState) {
            invokeInitHistoryCommentsFlow(userState as unknown as UserState)
        }
    }, [isHistoryCommentsInit, userState, invokeInitHistoryCommentsFlow])
}

function useInitVoteTabContent() {
    const { userState } = useUserState()
    const { isHistoryVotesInit, invokeInitHistoryVotesFlow } =
        useProfileHistoryStore((state) => ({
            isHistoryVotesInit: state.votes.isInit,
            invokeInitHistoryVotesFlow: state.invokeInitHistoryVotesFlow,
        }))
    useEffect(() => {
        if (!isHistoryVotesInit && userState) {
            invokeInitHistoryVotesFlow(userState as unknown as UserState)
        }
    }, [isHistoryVotesInit, userState, invokeInitHistoryVotesFlow])
}
