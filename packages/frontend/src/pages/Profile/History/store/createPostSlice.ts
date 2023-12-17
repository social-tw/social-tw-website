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
    invokeInitHistoryPostsFlow: async (userState: UserState) => {
        try {
            set((state) => {
                state.posts.isFetching = true
            })
            const postService = new PostService()
            const posts =
                await postService.fetchPostHistoryByUserState(userState)
            const sortedPosts = postService.sortPosts(
                posts,
                get().posts.activeFilter,
            )
            set((state) => {
                state.posts.data = sortedPosts
                state.posts.isInit = true
            })
        } catch (err) {
            console.error('Init History Posts Error:', err)
        } finally {
            set((state) => {
                state.posts.isFetching = false
            })
        }
    },
})
