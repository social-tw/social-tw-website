import { MutationKeys } from '@/constants/queryKeys'
import { useMutation } from '@tanstack/react-query'
import useUserState, { getGuaranteedUserState } from '@/hooks/useUserState'
import { relayUserStateTransition } from '@/utils/api'

export default function useUserStateTransition() {
    const { userState } = useUserState()

    const {
        isPending,
        error,
        mutateAsync: stateTransition,
    } = useMutation({
        mutationKey: [MutationKeys.UserStateTransition],
        mutationFn: async () => {
            const _userState = getGuaranteedUserState(userState)

            const latestTransitionedEpoch =
                await _userState.latestTransitionedEpoch()
            const currentEpoch = _userState.sync.calcCurrentEpoch()

            if (currentEpoch === latestTransitionedEpoch) {
                return
            }

            await _userState.waitForSync()
            const proof = await _userState.genUserStateTransitionProof()
            const data = await relayUserStateTransition(proof)
            await _userState.sync.provider.waitForTransaction(data.hash)
            await _userState.waitForSync()

            return data
        },
    })

    return {
        isPending,
        error,
        stateTransition,
    }
}
