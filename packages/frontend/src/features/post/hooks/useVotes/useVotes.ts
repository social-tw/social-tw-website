import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useActionCount, useUserState } from '@/features/core'
import { useProfileHistoryStore } from '@/features/profile'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { relayVote } from '@/utils/api'
import { VoteAction } from '@/types/Vote'

export function useVotes() {
    const queryClient = useQueryClient()

    const { getGuaranteedUserState } = useUserState()

    const invokeFetchHistoryVotesFlow = useProfileHistoryStore(
        (state) => state.invokeFetchHistoryVotesFlow,
    )

    const actionCount = useActionCount()

    const {
        isPending,
        error,
        mutateAsync: createVote,
    } = useMutation({
        mutationKey: [MutationKeys.Vote],
        mutationFn: async ({
            id,
            voteAction,
            votedNonce,
            votedEpoch,
        }: {
            id: string
            voteAction: VoteAction
            votedNonce: number | null
            votedEpoch: number | null
        }) => {
            const userState = await getGuaranteedUserState()
            let epochKeyProof
            // If user has voted before, generate proof for canceling the vote, if true will don't check epoch equals now epoch
            let enableEpochValidation = true
            if (votedNonce !== null && votedEpoch !== null) {
                epochKeyProof = await userState.genEpochKeyLiteProof({
                    nonce: votedNonce,
                    epoch: votedEpoch,
                })
                enableEpochValidation = false
            } else {
                const nonce = getEpochKeyNonce(actionCount)
                epochKeyProof = await userState.genEpochKeyLiteProof({ nonce })
            }

            await relayVote(
                epochKeyProof,
                id,
                voteAction,
                enableEpochValidation,
            )
            await userState.waitForSync()
            await invokeFetchHistoryVotesFlow(userState)

            return true
        },
        onSuccess: (_data, variables, _context) => {
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ManyComments, variables.id],
            })

            queryClient.invalidateQueries({
                queryKey: [QueryKeys.SinglePost, variables.id],
            })
        },
    })

    return {
        isPending,
        error,
        createVote,
    }
}
