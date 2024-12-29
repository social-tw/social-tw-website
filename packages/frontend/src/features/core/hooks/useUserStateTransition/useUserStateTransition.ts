import { MutationKeys } from '@/constants/queryKeys'
import { useUserState, useWeb3Provider } from '@/features/core'
import { relayUserStateTransition } from '@/utils/api'
import { useMutation } from '@tanstack/react-query'

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

            const fetchUserStateStart = new Date().getTime();
            const userState = await getGuaranteedUserState()
            const fetchUserStateEnd = new Date().getTime();
            console.log("Fetching user state Cost: ", fetchUserStateEnd - fetchUserStateStart, "ms");

            userState.sync.pollRate = 250
            const fetchLatestEpochStart = new Date().getTime();
            const latestTransitionedEpoch =
                await userState.latestTransitionedEpoch()
            const fetchLatestEpochEnd = new Date().getTime();
            console.log("Fetching latest epoch Cost: ", fetchLatestEpochEnd - fetchLatestEpochStart, "ms");

            const calcCurrentEpochStart = new Date().getTime();
            const currentEpoch = userState.sync.calcCurrentEpoch()
            const calcCurrentEpochEnd = new Date().getTime();
            console.log("Calculating current epoch Cost: ", calcCurrentEpochEnd - calcCurrentEpochStart, "ms");

            if (currentEpoch === latestTransitionedEpoch) {
                return
            }

            await userState.waitForSync()
            const genUSTproofStart = new Date().getTime();
            const proof = await userState.genUserStateTransitionProof()
            const genUSTproofEnd = new Date().getTime();
            console.log("Generating UST proof Cost: ", genUSTproofEnd - genUSTproofStart, "ms");

            const relayUSTproofStart = new Date().getTime();
            const data = await relayUserStateTransition(proof)
            const relayUSTproofEnd = new Date().getTime();
            console.log("Relaying UST proof Cost: ", relayUSTproofEnd - relayUSTproofStart, "ms");
            
            const waitingForTxStart = new Date().getTime();
            await provider.waitForTransaction(data.txHash)
            const waitingForTxEnd = new Date().getTime();
            console.log("Waiting for tx Cost: ", waitingForTxEnd - waitingForTxStart, "ms");

            const userStateWaitingStart = new Date().getTime();
            await userState.waitForSync()
            const userStateWaitingEnd = new Date().getTime();
            console.log("User state waiting Cost: ", userStateWaitingEnd - userStateWaitingStart, "ms");

            return data
        },
    })

    return {
        isPending,
        error,
        stateTransition,
    }
}
