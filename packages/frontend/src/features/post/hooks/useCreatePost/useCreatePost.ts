import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    failActionById,
    PostData,
    PostService,
    succeedActionById,
    useActionCount,
    useUserState,
    useUserStateTransition,
    useWeb3Provider,
} from '@/features/core'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { useSendNotification } from '@/features/notification/stores/useNotificationStore'
import { NotificationType } from '@/types/Notifications'

export function useCreatePost() {
    const sendNotification = useSendNotification()
    const queryClient = useQueryClient()

    const { getGuaranteedProvider } = useWeb3Provider()

    const { getGuaranteedUserState } = useUserState()

    const { stateTransition } = useUserStateTransition()

    const actionCount = useActionCount()

    const {
        isPending,
        error,
        reset,
        mutateAsync: createPost,
    } = useMutation({
        mutationKey: [MutationKeys.CreatePost],
        mutationFn: async ({ content }: { content: string }) => {
            const provider = getGuaranteedProvider()
            const userState = await getGuaranteedUserState()

            console.log('createPost', { content })
            const startUST = new Date().getTime();
            await stateTransition()
            const endUST = new Date().getTime();
            console.log("State Transition Cost: ", endUST - startUST, "ms");

            const identityNonce = getEpochKeyNonce(Math.max(0, actionCount - 1))

            const postService = new PostService(userState)
            const { txHash, epoch, epochKey } = await postService.createPost({
                content,
                identityNonce,
            })

            const receipt = await provider.waitForTransaction(txHash)
            const postId = ethers.BigNumber.from(
                receipt.logs[0].topics[2],
            ).toString()

            await userState.waitForSync()

            return {
                transactionHash: txHash,
                postId,
                content,
                epoch,
                epochKey,
            }
        },
        onMutate: async (variables) => {
            const postData: PostData = {
                postId: undefined,
                content: variables.content,
                epochKey: undefined,
                transactionHash: undefined,
            }
            const actionId = addAction(ActionType.Post, postData)
            return { actionId }
        },
        onError: (_error, _variables, context) => {
            if (context?.actionId) {
                failActionById(context.actionId)
            }
            sendNotification(NotificationType.POST_FAILED, context?.actionId)
        },
        onSuccess: (data, _variables, context) => {
            succeedActionById(context.actionId, {
                postId: data.postId,
                epochKey: data.epochKey,
                transactionHash: data.transactionHash,
            })

            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ManyPosts],
            })

            queryClient.invalidateQueries({
                queryKey: [QueryKeys.SinglePost, data.postId],
            })
            sendNotification(NotificationType.POST_SUCCEEDED, data.postId)
        },
    })

    return {
        isPending,
        error,
        reset,
        createPost,
    }
}
