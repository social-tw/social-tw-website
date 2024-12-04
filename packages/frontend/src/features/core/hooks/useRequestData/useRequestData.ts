import { useMutation } from '@tanstack/react-query'
import { useUserState, useWeb3Provider } from '@/features/core'
import { relayRequestData } from '@/utils/api'
import { MutationKeys } from '@/constants/queryKeys'

export function useRequestData() {
    const { getGuaranteedProvider } = useWeb3Provider()

    const { getGuaranteedUserState } = useUserState()

    const {
        isPending,
        error,
        mutateAsync: requestData,
    } = useMutation({
        mutationKey: [MutationKeys.RequestData],
        mutationFn: async ({
            reqData,
            epkNonce,
        }: {
            reqData: Record<number, string | number>
            epkNonce: number
        }) => {
            const provider = getGuaranteedProvider()
            const userState = await getGuaranteedUserState()

            const filteredReqData = Object.entries(reqData)
                .filter(([, value]) => value !== '')
                .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})

            if (Object.keys(filteredReqData).length === 0) {
                throw new Error('No data in the attestation')
            }

            const proof = await userState.genEpochKeyProof({
                nonce: epkNonce,
            })
            const { txHash } = await relayRequestData(proof, filteredReqData)
            await provider.waitForTransaction(txHash)
            await userState.waitForSync()
        },
    })

    return {
        isPending,
        error,
        requestData,
    }
}
