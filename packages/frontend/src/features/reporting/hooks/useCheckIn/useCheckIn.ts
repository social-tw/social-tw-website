import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
    useActionCount,
    UserService,
    useUserState,
    useUserStateTransition,
    useWeb3Provider,
} from '@/features/core'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCheckIn() {
    const queryClient = useQueryClient()

    const { getGuaranteedProvider } = useWeb3Provider()

    const { getGuaranteedUserState } = useUserState()

    const { stateTransition } = useUserStateTransition()

    const actionCount = useActionCount()

    return useMutation({
        mutationKey: [MutationKeys.CheckIn],
        mutationFn: async () => {
            await stateTransition()

            const provider = getGuaranteedProvider()

            const userState = await getGuaranteedUserState()

            const userService = new UserService(userState)

            const identityNonce = getEpochKeyNonce(Math.max(0, actionCount - 1))

            const { txHash, epoch, epochKey } = await userService.checkIn({
                identityNonce,
            })

            await provider.waitForTransaction(txHash)

            await userState.waitForSync()

            return {
                transactionHash: txHash,
                epoch,
                epochKey,
            }
        },
        onMutate: (_variables) => {
            const actionId = addAction(ActionType.CheckIn, undefined)
            return { actionId }
        },
        onError: (_error, _variables, context) => {
            if (context?.actionId) {
                failActionById(context.actionId)
            }
        },
        onSuccess: async (data, _variables, context) => {
            succeedActionById(context.actionId, {
                epochKey: data.epochKey,
                transactionHash: data.transactionHash,
            })

            await queryClient.invalidateQueries({
                queryKey: [QueryKeys.ReputationScore],
            })
        },
    })
}
