import { UserState } from '@unirep/core'
import { Directions, SortKeys } from '../../../../types/api'
import { fetchPostsByEpochKeys } from '../../../../utils/api'
import { ProfileHistoryStoreParser } from '../ProfileHistoryStoreParser'
import { ActiveFilter, StatePostSlice } from '../types'
import { getEpochKeyChunks } from '../utils'

export const createPostSlice: StatePostSlice = (set) => ({
    posts: {
        activeFilter: ActiveFilter.Latest,
        isFetching: false,
        isInit: false,
        data: [],
    },
    setPostActiveFilterToLatest: () =>
        set((state) => {
            state.posts.activeFilter = ActiveFilter.Latest
        }),
    setPostActiveFilterToOldest: () =>
        set((state) => {
            state.posts.activeFilter = ActiveFilter.Oldest
        }),
    setPostActiveFilterToPopularity: () =>
        set((state) => {
            state.posts.activeFilter = ActiveFilter.Popularity
        }),
    fetchPosts: async (userState: UserState) => {
        try {
            set((state) => {
                state.posts.isFetching = true
            })
            const currentEpoch = userState.sync.calcCurrentEpoch()
            const epochKeyChunks = getEpochKeyChunks(
                userState,
                currentEpoch,
                10,
            )
            const batchedRawPosts = await Promise.all(
                epochKeyChunks.map((epochKeyChunk) =>
                    fetchPostsByEpochKeys({
                        epochKeys: epochKeyChunk,
                        direction: Directions.Asc,
                        sortKey: SortKeys.PublishedAt,
                    }),
                ),
            )
            const batchedPosts = batchedRawPosts.map(
                ProfileHistoryStoreParser.parseRelaySourcePostsToPosts,
            )
            set((state) => {
                state.posts.data = batchedPosts.flat(2)
                if (!state.posts.isInit) {
                    state.posts.isInit = true
                }
            })
        } catch (err) {
            // TODO: handle error
            // console.log('FetchPosts Error:', err)
        } finally {
            set((state) => {
                state.posts.isFetching = false
            })
        }
    },
})
