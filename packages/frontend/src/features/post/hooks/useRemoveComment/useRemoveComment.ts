import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
    useUserState,
    useUserStateTransition,
    useWeb3Provider,
} from '@/features/core'
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import { fetchUserReputation, relayRemoveComment } from '@/utils/api'
import { ReputationTooLowError } from '@/utils/errors'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRemoveComment() {
    const queryClient = useQueryClient()

    const { getGuaranteedProvider } = useWeb3Provider()

    const { getGuaranteedUserState } = useUserState()

    const { stateTransition } = useUserStateTransition()

    const {
        isPending,
        error,
        mutateAsync: removeComment,
    } = useMutation({
        mutationKey: [MutationKeys.RemoveComment],
        mutationFn: async ({
            postId,
            commentId,
            epoch,
            nonce,
        }: {
            postId: string
            commentId: string
            epoch: number
            nonce: number
        }) => {
            const provider = getGuaranteedProvider()
            const userState = await getGuaranteedUserState()

            await stateTransition()

            const proof = await userState.genEpochKeyLiteProof({
                epoch,
                nonce,
            })

            const { txHash } = await relayRemoveComment(
                proof,
                postId,
                commentId,
            )
            await provider.waitForTransaction(txHash)
            await userState.waitForSync()
        },
        onMutate: async (variables) => {
            const reputation = await fetchUserReputation()
            if (reputation < 0) {
                openForbidActionDialog()
                throw new ReputationTooLowError()
            }
            const actionId = addAction(ActionType.DeleteComment, {
                postId: variables.postId,
                commentId: variables.commentId,
                epoch: variables.epoch,
            })

            return { actionId }
        },
        onError: (_error, _variables, context) => {
            if (context?.actionId) {
                failActionById(context.actionId)
            }
        },
        onSuccess: (_data, variables, context) => {
            succeedActionById(context.actionId)

            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ManyComments, variables.postId],
            })

            queryClient.invalidateQueries({
                queryKey: [QueryKeys.SinglePost, variables.postId],
            })
        },
    })

    return {
        isPending,
        error,
        removeComment,
    }
}
