import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { useActionCount, useUserState, VoteService } from '@/features/core'
import { VoteAction } from '@/types/Vote'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSendNotification } from '@/features/notification/stores/useNotificationStore'
import { NotificationType } from '@/types/Notifications'

export function useVotes() {
    const queryClient = useQueryClient()
    const { getGuaranteedUserState } = useUserState()
    const actionCount = useActionCount()
    const sendNotification = useSendNotification()
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

            return { postId: id, voteAction }
        },
        onSuccess: (data, variables, _context) => {
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
        onError: (_error, variables, _context) => {
            const notificationType =
                variables.voteAction === VoteAction.UPVOTE
                    ? NotificationType.UPVOTE_FAILED
                    : NotificationType.DOWNVOTE_FAILED

            sendNotification(notificationType, variables.id)
        },
    })

    return {
        isPending,
        error,
        createVote,
    }
}
