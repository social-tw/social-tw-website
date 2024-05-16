import { UserState } from '@unirep/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProfileHistoryStore } from '@/pages/Profile/History/store/useProfileHistoryStore'
import { useActionCount } from '@/hooks/useActionCount/useActionCount'
import { useUserState } from '@/hooks/useUserState/useUserState'
import { getEpochKeyNonce } from '@/utils/getEpochKeyNonce'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { relayVote } from '@/utils/api'
import { VoteAction } from '@/types'

export function useVotes() {
    const queryClient = useQueryClient()

    const { userState, getGuaranteedUserState } = useUserState()

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
        }: {
            id: string
            voteAction: VoteAction
        }) => {
            const userState = getGuaranteedUserState()

            const nonce = getEpochKeyNonce(actionCount)
            const epochKeyProof = await userState.genEpochKeyProof({ nonce })

            await relayVote(epochKeyProof, id, voteAction)
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
