import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { useActionCount, useUserState } from '@/features/core'
import { useProfileHistoryStore } from '@/features/profile'
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import { VoteAction } from '@/types/Vote'
import { fetchUserReputation, relayVote } from '@/utils/api'
import { ReputationTooLowError } from '@/utils/errors'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
            if (votedNonce !== null && votedEpoch !== null) {
                epochKeyProof = await userState.genEpochKeyLiteProof({
                    nonce: votedNonce,
                    epoch: votedEpoch,
                })
            } else {
                const nonce = getEpochKeyNonce(actionCount)
                epochKeyProof = await userState.genEpochKeyLiteProof({ nonce })
            }

            await relayVote(epochKeyProof, id, voteAction)
            await userState.waitForSync()
            await invokeFetchHistoryVotesFlow(userState)

            return true
        },
        onMutate: async () => {
            const reputation = await fetchUserReputation()
            if (reputation < 0) {
                openForbidActionDialog()
                throw new ReputationTooLowError()
            }
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
