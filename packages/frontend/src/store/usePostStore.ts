import { create } from 'zustand'

import { StoreState } from './storeTypes'

const useStore = create<StoreState>((set) => ({
    posts: [],
    updateVoteCount: (postId, upCount, downCount) =>
        set((state) => ({
            posts: state.posts.map((post) =>
                post.id === postId ? { ...post, upCount, downCount } : post,
            ),
        })),
}))

export default useStore
