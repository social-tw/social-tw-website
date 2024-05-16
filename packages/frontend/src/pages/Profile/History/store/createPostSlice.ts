import { UserState } from '@unirep/core'
import { PostService } from '../services/PostService'
import { ActiveFilter, StatePostSlice } from '../types'

export const createPostSlice: StatePostSlice = (set, get) => ({
    posts: {
        activeFilter: ActiveFilter.DateAsc,
        isFetching: false,
        isInit: false,
        data: [],
    },
    setPostActiveFilterToDateAsc: () => {
        set((state) => {
            const posts = state.posts.data
            const postService = new PostService()
            const sortedPosts = postService.sortPosts(
                posts,
                ActiveFilter.DateAsc,
            )
            state.posts.activeFilter = ActiveFilter.DateAsc
            state.posts.data = sortedPosts
        })
    },
    setPostActiveFilterToDateDesc: () => {
        set((state) => {
            const posts = state.posts.data
            const postService = new PostService()
            const sortedPosts = postService.sortPosts(
                posts,
                ActiveFilter.DateDesc,
            )
            state.posts.activeFilter = ActiveFilter.DateDesc
            state.posts.data = sortedPosts
        })
    },
    setPostActiveFilterToPopularityAsc: () => {
        set((state) => {
            const posts = state.posts.data
            const postService = new PostService()
            const sortedPosts = postService.sortPosts(
                posts,
                ActiveFilter.PopularityAsc,
            )
            state.posts.activeFilter = ActiveFilter.PopularityAsc
            state.posts.data = sortedPosts
        })
    },
    invokeFetchHistoryPostsFlow: async (userState: UserState) => {
        const isInit = get().posts.isInit
        if (!isInit) {
            await get().invokeInitHistoryPostsFlow(userState)
        } else {
            await get().invokeRefetchHistoryPostsFlow(userState)
        }
    },
    invokeRefetchHistoryPostsFlow: async (userState: UserState) => {
        try {
            set((state) => {
                state.posts.isFetching = true
            })
            const activeFilter = get().posts.activeFilter
            const sortedPosts = await _fetchHistoryPostsAndSorted(
                userState,
                activeFilter,
            )
            set((state) => {
                state.posts.data = sortedPosts
            })
        } finally {
            set((state) => {
                state.posts.isFetching = false
            })
        }
    },
    invokeInitHistoryPostsFlow: async (userState: UserState) => {
        try {
            set((state) => {
                state.posts.isFetching = true
            })
            const activeFilter = get().posts.activeFilter
            const sortedPosts = await _fetchHistoryPostsAndSorted(
                userState,
                activeFilter,
            )
            set((state) => {
                state.posts.data = sortedPosts
                state.posts.isInit = true
            })
        } finally {
            set((state) => {
                state.posts.isFetching = false
            })
        }
    },
})

async function _fetchHistoryPostsAndSorted(
    userState: UserState,
    activeFilter: ActiveFilter,
) {
    const postService = new PostService()
    const posts = await postService.fetchPostHistoryByUserState(userState)
    const sortedPosts = postService.sortPosts(posts, activeFilter)
    return sortedPosts
}
