import { MutationKeys } from '@/constants/queryKeys'
import { useMutation } from '@tanstack/react-query'
import { useUserState } from '@/hooks/useUserState'
import { relayUserStateTransition } from '@/utils/api'

export function useUserStateTransition() {
    const { getGuaranteedUserState } = useUserState()

    const {
        isPending,
        error,
        mutateAsync: stateTransition,
    } = useMutation({
        mutationKey: [MutationKeys.UserStateTransition],
        mutationFn: async () => {
            const userState = getGuaranteedUserState()

            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()
            const currentEpoch = userState.sync.calcCurrentEpoch()

            if (currentEpoch === latestTransitionedEpoch) {
                return
            }

            await userState.waitForSync()
            const proof = await userState.genUserStateTransitionProof()
            const data = await relayUserStateTransition(proof)
            await userState.sync.provider.waitForTransaction(data.hash)
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
