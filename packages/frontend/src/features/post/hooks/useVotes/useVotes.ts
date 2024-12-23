import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { useActionCount, useUserState, useUserStateTransition, VoteService } from '@/features/core'
import { VoteAction } from '@/types/Vote'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/features/core'
import { useSendNotification } from '@/features/notification/stores/useNotificationStore'
import { NotificationType } from '@/types/Notifications'

export function useVotes() {
    const queryClient = useQueryClient()
    const { getGuaranteedUserState } = useUserState()
    const actionCount = useActionCount()
    const sendNotification = useSendNotification()
    const { stateTransition } = useUserStateTransition()

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

            await stateTransition()

            const epoch = votedEpoch ?? undefined
            const nonce = votedNonce ?? getEpochKeyNonce(actionCount)

            await voteService.createVote({
                postId: id,
                voteAction,
                epoch,
                identityNonce: nonce,
            })

            await userState.waitForSync()

            return { postId: id, voteAction }
        },
        onMutate: async (variables) => {
            const actionId = addAction(
                getActionTypeFromVoteAction(variables.voteAction),
                {
                    postId: variables.id,
                    epoch: variables.votedEpoch,
                    identityNonce:
                        variables.votedNonce ?? getEpochKeyNonce(actionCount),
                },
            )
            return { actionId }
        },
        onError: (_error, variables, context) => {
            if (context?.actionId) {
                failActionById(context.actionId)
            }
            const notificationType =
                variables.voteAction === VoteAction.UPVOTE
                    ? NotificationType.UPVOTE_FAILED
                    : NotificationType.DOWNVOTE_FAILED

            sendNotification(notificationType, variables.id)
        },
        onSuccess: (data, variables, context) => {
            if (context?.actionId) {
                succeedActionById(context.actionId)
            }

            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ManyComments, variables.id],
            })

            queryClient.invalidateQueries({
                queryKey: [QueryKeys.SinglePost, variables.id],
            })

            const notificationType =
                data.voteAction === VoteAction.UPVOTE
                    ? NotificationType.UPVOTE_SUCCEEDED
                    : NotificationType.DOWNVOTE_SUCCEEDED

            sendNotification(notificationType, data.postId)
        },
    })

    return {
        isPending,
        error,
        createVote,
    }
}
