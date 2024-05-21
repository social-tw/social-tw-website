import { ethers } from 'ethers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ActionType,
    addAction,
    failActionById,
    PostData,
    succeedActionById,
} from '@/contexts/Actions'
import { useActionCount } from '@/hooks/useActionCount/useActionCount'
import { useWeb3Provider } from '@/hooks/useWeb3Provider/useWeb3Provider'
import { useUserState } from '@/hooks/useUserState/useUserState'
import { useUserStateTransition } from '@/hooks/useUserStateTransition/useUserStateTransition'
import { getEpochKeyNonce } from '@/utils/getEpochKeyNonce'
import { relayCreatePost } from '@/utils/api'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'

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

            const nonce = getEpochKeyNonce(Math.max(0, actionCount - 1))

            const proof = await userState.genEpochKeyProof({
                nonce,
            })

            const epoch = Number(proof.epoch)
            const epochKey = proof.epochKey.toString()

            const { txHash } = await relayCreatePost(proof, content)

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
        onMutate: (variables) => {
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

            queryClient.invalidateQueries({
                queryKey: [QueryKeys.Counter],
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
