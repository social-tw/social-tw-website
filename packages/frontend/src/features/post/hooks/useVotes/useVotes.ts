import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { useActionCount, useUserState, VoteService } from '@/features/core'
import { VoteAction } from '@/types/Vote'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/features/core'

export function useVotes() {
    const queryClient = useQueryClient()

    const { getGuaranteedUserState } = useUserState()

    const actionCount = useActionCount()

    const getActionTypeFromVoteAction = (voteAction: VoteAction) => {
        switch (voteAction) {
            case VoteAction.UPVOTE:
                return ActionType.UpVote
            case VoteAction.DOWNVOTE:
                return ActionType.DownVote
            case VoteAction.CANCEL_UPVOTE:
                return ActionType.CancelUpVote
            case VoteAction.CANCEL_DOWNVOTE:
                return ActionType.CancelDownVote
            default:
                throw new Error('Invalid vote action')
        }
    }

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

            const voteService = new VoteService(userState)

            const epoch = votedEpoch ?? undefined
            const nonce = votedNonce ?? getEpochKeyNonce(actionCount)

            await voteService.createVote({
                postId: id,
                voteAction,
                epoch,
                identityNonce: nonce,
            })

            await userState.waitForSync()

            return true
        },
        onMutate: async (variables) => {
            const actionId = addAction(
                getActionTypeFromVoteAction(variables.voteAction),
                {
                    postId: variables.id,
                    epoch: variables.votedEpoch,
                    identityNonce: variables.votedNonce ?? getEpochKeyNonce(actionCount),
                }
            )
            return { actionId }
        },
        onError: (_error, _variables, context) => {
            if (context?.actionId) {
                failActionById(context.actionId)
            }
        },
        onSuccess: (_data, variables, context) => {
            if (context?.actionId) {
                succeedActionById(context.actionId)
            }

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
