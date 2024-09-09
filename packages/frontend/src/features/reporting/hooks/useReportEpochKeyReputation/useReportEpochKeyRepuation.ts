import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    useActionCount,
    useUserState,
    useUserStateTransition,
    useWeb3Provider,
} from '@/features/core'
import { genReportNonNullifierProof } from '@/features/core/utils/genReportNonNullifierProof'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { relayClaimReputation } from '@/utils/api'
import { RepUserType } from '@/types/Report'

export function useReportEpochKeyRepuation() {
    const { stateTransition } = useUserStateTransition()
    const { getGuaranteedUserState } = useUserState()
    const actionCount = useActionCount()
    const { getGuaranteedProvider } = useWeb3Provider()
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: [MutationKeys.ClaimEpochKeyReputation],
        mutationFn: async ({
            reportId,
            reportedEpochKey,
            reportedEpoch,
            repUserType,
        }: {
            reportId: string
            reportedEpochKey: bigint
            reportedEpoch: number
            repUserType: RepUserType
        }) => {
            await stateTransition()
            const userState = await getGuaranteedUserState()
            const nonce = getEpochKeyNonce(actionCount)

            const { publicSignals, proof } = await genReportNonNullifierProof(
                userState,
                {
                    reportId,
                    reportedEpochKey,
                    reportedEpoch,
                    nonce,
                },
            )
            const result = await relayClaimReputation(
                reportId,
                repUserType,
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
