import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    CommentService,
    failActionById,
    succeedActionById,
    useActionCount,
    useUserState,
    useUserStateTransition,
    useWeb3Provider,
} from '@/features/core'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { delay } from 'lodash'
import NotificationService from '@/features/notification/services/NotificationService'

export function useCreateComment() {
    const queryClient = useQueryClient()

    const { getGuaranteedProvider } = useWeb3Provider()

    const { getGuaranteedUserState } = useUserState()

    const { stateTransition } = useUserStateTransition()

    const actionCount = useActionCount()

    const {
        isPending,
        error,
        reset,
        mutateAsync: createComment,
    } = useMutation({
        mutationKey: [MutationKeys.CreateComment],
        mutationFn: async ({
            postId,
            content,
        }: {
            postId: string
            content: string
        }) => {
            const provider = getGuaranteedProvider()
            const userState = await getGuaranteedUserState()

            await stateTransition()

            const identityNonce = getEpochKeyNonce(Math.max(0, actionCount - 1))

            const commentService = new CommentService(userState)
            const { txHash, epoch, epochKey } =
                await commentService.createComment({
                    content,
                    postId,
                    identityNonce,
                })

            const receipt = await provider.waitForTransaction(txHash)

            const commentId = ethers.BigNumber.from(
                receipt.logs[0].topics[3],
            ).toString()

            await userState.waitForSync()

            return {
                transactionHash: txHash,
                postId,
                commentId,
                content,
                epoch,
                epochKey,
            }
        },
        onMutate: async (variables) => {
            const commentData = {
                commentId: undefined,
                postId: variables.postId,
                content: variables.content,
                epoch: undefined,
                transactionHash: undefined,
            }
            const actionId = addAction(ActionType.Comment, commentData)
            return { actionId }
        },
        onError: (_error, _variables, context) => {
            if (context?.actionId) {
                failActionById(context.actionId)
            }
            NotificationService.sendNotification('COMMENT_FAILED', context?.actionId)
        },
        onSuccess: (data, variables, context) => {
            succeedActionById(context.actionId, {
                commentId: data.commentId,
                epoch: data.epoch,
                epochKey: data.epochKey,
                transactionHash: data.transactionHash,
            })

            delay(async () => {
                await queryClient.invalidateQueries({
                    queryKey: [QueryKeys.ManyComments, variables.postId],
                })

                await queryClient.invalidateQueries({
                    queryKey: [QueryKeys.SinglePost, variables.postId],
                })
            }, 1000)
            NotificationService.sendNotification('COMMENT_SUCCEED', data.commentId)
        },
    })

    return {
        isPending,
        error,
        reset,
        createComment,
    }
}
