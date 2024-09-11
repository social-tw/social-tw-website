import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    useActionCount,
    useUserState,
    useUserStateTransition,
    useWeb3Provider,
} from '@/features/core'
import { genReportNullifierProof } from '@/features/core/utils/genReportNullifierProof'
import { RepUserType } from '@/types/Report'
import { relayClaimReputation } from '@/utils/api'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useReportAdjudicatorReputation() {
    const { stateTransition } = useUserStateTransition()
    const { getGuaranteedUserState } = useUserState()
    const actionCount = useActionCount()
    const { getGuaranteedProvider } = useWeb3Provider()
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: [MutationKeys.ClaimAdjudicatorReputation],
        mutationFn: async (reportId: string) => {
            await stateTransition()
            const userState = await getGuaranteedUserState()
            const nonce = getEpochKeyNonce(actionCount)
            const { publicSignals, proof } = await genReportNullifierProof(
                userState,
                { reportId, nonce: nonce },
            )
            const result = await relayClaimReputation(
                reportId,
                RepUserType.VOTER,
                publicSignals,
                proof,
            )
            const provider = getGuaranteedProvider()
            await provider.waitForTransaction(result.message.txHash)
            await userState.waitForSync()

            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ReputationScore],
            })
        },
    })
}
