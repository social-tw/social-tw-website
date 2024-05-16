import { ethers } from 'ethers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import { useActionCount } from '@/hooks/useActionCount/useActionCount'
import { useWeb3Provider } from '@/hooks/useWeb3Provider/useWeb3Provider'
import { useUserState } from '@/hooks/useUserState/useUserState'
import { useUserStateTransition } from '@/hooks/useUserStateTransition/useUserStateTransition'
import { getEpochKeyNonce } from '@/utils/getEpochKeyNonce'
import { relayCreateComment } from '@/utils/api'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'

export function useCreateComment() {
    const queryClient = useQueryClient()

    const { getGuaranteedProvider } = useWeb3Provider()

    const { getGuaranteedUserState } = useUserState()

    const { stateTransition } = useUserStateTransition()

    const actionCount = useActionCount()

    const {
        isPending,
        error,
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

            const nonce = getEpochKeyNonce(actionCount)
            const epochKeyProof = await userState.genEpochKeyProof({ nonce })

            const epoch = Number(epochKeyProof.epoch)
            const epochKey = epochKeyProof.epochKey.toString()

            const { txHash } = await relayCreateComment(
                epochKeyProof,
                postId,
                content,
            )

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
        onMutate: (variables) => {
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
        },
        onSuccess: (data, variables, context) => {
            succeedActionById(context.actionId, {
                commentId: data.commentId,
                epoch: data.epoch,
                epochKey: data.epochKey,
                transactionHash: data.transactionHash,
            })

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
        createComment,
    }
}