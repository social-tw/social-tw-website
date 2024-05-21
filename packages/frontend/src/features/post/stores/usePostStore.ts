import { create } from 'zustand'
import type { PostInfo } from '@/types/Post'

interface StoreState {
    posts: PostInfo[]
    updateVoteCount: (
        postId: string,
        upCount: number,
        downCount: number,
    ) => void
}

export const usePostStore = create<StoreState>((set) => ({
    posts: [],
    updateVoteCount: (postId, upCount, downCount) =>
        set((state) => ({
            posts: state.posts.map((post) =>
                post.id === postId ? { ...post, upCount, downCount } : post,
            ),
        })),
}))
