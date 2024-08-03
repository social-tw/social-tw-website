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
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import { fetchUserReputation } from '@/utils/api'
import { ReputationTooLowError } from '@/utils/errors'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ethers } from 'ethers'

export function useCreatePost() {
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

            await stateTransition()

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
            const reputation = await fetchUserReputation()
            if (reputation < 0) {
                openForbidActionDialog()
                throw new ReputationTooLowError()
            }
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
        },
    })

    return {
        isPending,
        error,
        reset,
        createPost,
    }
}
