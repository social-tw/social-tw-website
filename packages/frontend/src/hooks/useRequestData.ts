import { useMutation } from '@tanstack/react-query'
import { useUserState } from '@/hooks/useUserState'
import { useWeb3Provider } from '@/hooks/useWeb3Provider'
import { relayRequestData } from '@/utils/api'
import { MutationKeys } from '@/constants/queryKeys'

export default function useRequestData() {
    const { getGuaranteedProvider } = useWeb3Provider()

    const { getGuaranteedUserState } = useUserState()

    const {
        isPending,
        error,
        mutateAsync: requestData,
    } = useMutation({
        mutationKey: [MutationKeys.ReuestData],
        mutationFn: async ({
            reqData,
            epkNonce,
        }: {
            reqData: Record<number, string | number>
            epkNonce: number
        }) => {
            const provider = getGuaranteedProvider()
            const userState = getGuaranteedUserState()

            const filteredReqData = Object.entries(reqData)
                .filter(([, value]) => value !== '')
                .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})

            if (Object.keys(filteredReqData).length === 0) {
                throw new Error('No data in the attestation')
            }

            const proof = await userState.genEpochKeyProof({
                nonce: epkNonce,
            })
            const data = await relayRequestData(proof, filteredReqData)
            await provider.waitForTransaction(data.hash)
            await userState.waitForSync()
        },
    })

    return {
        isPending,
        error,
        requestData,
    }
}
