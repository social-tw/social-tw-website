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
            votedNonce: number | null
            votedEpoch: number | null
        }
    >
    updateVote: (
        postId: string,
        upCount: number,
        downCount: number,
        isMine: boolean,
        finalAction: VoteAction | null,
        votedNonce: number | null,
        votedEpoch: number | null,
    ) => void
}

export const useVoteStore = create<VoteState>((set) => ({
    votes: {},
    updateVote: (
        postId,
        upCount,
        downCount,
        isMine,
        finalAction,
        votedNonce,
        votedEpoch,
    ) =>
        set((state) => ({
            votes: {
                ...state.votes,
                [postId]: {
                    upCount,
                    downCount,
                    isMine,
                    finalAction,
                    votedNonce,
                    votedEpoch,
                },
            },
        })),
}))
