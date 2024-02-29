import { PostInfo } from '@/types'

export interface StoreState {
    posts: PostInfo[]
    updateVoteCount: (
        postId: string,
        upCount: number,
        downCount: number,
    ) => void
}
