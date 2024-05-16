import { MutationKeys } from '@/constants/queryKeys'
import { useMutation } from '@tanstack/react-query'
import { useWeb3Provider } from '@/hooks/useWeb3Provider/useWeb3Provider'
import { useUserState } from '@/hooks/useUserState/useUserState'
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
            await provider.waitForTransaction(data.hash)
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
