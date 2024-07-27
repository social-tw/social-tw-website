import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    CommentService,
    failActionById,
    succeedActionById,
    useUserState,
    useUserStateTransition,
    useWeb3Provider,
} from '@/features/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { delay } from 'lodash'

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

            const commentService = new CommentService(userState)
            const { txHash } = await commentService.removeComment(commentId, postId, epoch, nonce)

            await provider.waitForTransaction(txHash)
            await userState.waitForSync()
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

            delay(async() => {
                await queryClient.invalidateQueries({
                    queryKey: [QueryKeys.ManyComments, variables.postId],
                })
    
                await queryClient.invalidateQueries({
                    queryKey: [QueryKeys.SinglePost, variables.postId],
                })
            }, 1000)
        },
    })

    return {
        isPending,
        error,
        removeComment,
    }
}
