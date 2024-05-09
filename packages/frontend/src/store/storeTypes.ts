import { PostInfo } from '@/types/Post'

export interface StoreState {
    posts: PostInfo[]
    updateVoteCount: (
        postId: string,
        upCount: number,
        downCount: number,
    ) => void
}
