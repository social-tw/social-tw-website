import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import useUserState, { getGuaranteedUserState } from '@/hooks/useUserState'
import { relayRemoveComment } from '@/utils/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useWeb3Provider, {
    getGuaranteedWeb3Provider,
} from '@/hooks/useWeb3Provider'
import useUserStateTransition from '@/hooks/useUserStateTransition'

export default function useRemoveComment() {
    const queryClient = useQueryClient()

    const provider = useWeb3Provider()

    const { userState } = useUserState()

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
            const _provider = getGuaranteedWeb3Provider(provider)
            const _userState = getGuaranteedUserState(userState)

            await stateTransition()

            const proof = await _userState.genEpochKeyLiteProof({
                epoch,
                nonce,
            })

            const { txHash } = await relayRemoveComment(
                proof,
                postId,
                commentId,
            )
            await _provider.waitForTransaction(txHash)
            await _userState.waitForSync()
        },
        onMutate: (variables) => {
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
