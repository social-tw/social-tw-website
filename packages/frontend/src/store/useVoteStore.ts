import { VoteAction } from '@/types/Vote'
import { create } from 'zustand'

type VoteState = {
    votes: Record<
        string,
        {
            upCount: number
            downCount: number
            isMine: boolean
            finalAction: VoteAction | null
        }
    >
    updateVote: (
        postId: string,
        upCount: number,
        downCount: number,
        isMine: boolean,
        finalAction: VoteAction | null,
    ) => void
}

const useVoteStore = create<VoteState>((set) => ({
    votes: {},
    updateVote: (postId, upCount, downCount, isMine, finalAction) =>
        set((state) => ({
            votes: {
                ...state.votes,
                [postId]: { upCount, downCount, isMine, finalAction },
            },
        })),
}))

export default useVoteStore
