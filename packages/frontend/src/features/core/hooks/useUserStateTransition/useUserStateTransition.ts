import { useMutation } from '@tanstack/react-query'
import { useUserState, useWeb3Provider } from '@/features/core'
import { MutationKeys } from '@/constants/queryKeys'
import { relayUserStateTransition } from '@/utils/api'

export function useUserStateTransition() {
    const { getGuaranteedProvider } = useWeb3Provider()
    const { getGuaranteedUserState } = useUserState()

    const {
        isPending,
        error,
        mutateAsync: stateTransition,
    } = useMutation({
        mutationKey: [MutationKeys.UserStateTransition],
        mutationFn: async () => {
            const provider = getGuaranteedProvider()
            const userState = await getGuaranteedUserState()

            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()
            const currentEpoch = userState.sync.calcCurrentEpoch()

            if (currentEpoch === latestTransitionedEpoch) {
                return
            }

            await userState.waitForSync()
            const proof = await userState.genUserStateTransitionProof()
            const data = await relayUserStateTransition(proof)
            await provider.waitForTransaction(data.txHash)
            await userState.waitForSync()

            return data
        },
    })

    return {
        isPending,
        error,
        stateTransition,
    }
}
