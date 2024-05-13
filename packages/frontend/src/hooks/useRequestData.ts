import { useMutation } from '@tanstack/react-query'
import useUserState, { getGuaranteedUserState } from '@/hooks/useUserState'
import useWeb3Provider, {
    getGuaranteedWeb3Provider,
} from '@/hooks/useWeb3Provider'
import { relayRequestData } from '@/utils/api'
import { MutationKeys } from '@/constants/queryKeys'

export default function useRequestData() {
    const provider = useWeb3Provider()

    const { userState } = useUserState()

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
            const _provider = getGuaranteedWeb3Provider(provider)
            const _userState = getGuaranteedUserState(userState)

            const filteredReqData = Object.entries(reqData)
                .filter(([, value]) => value !== '')
                .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})

            if (Object.keys(filteredReqData).length === 0) {
                throw new Error('No data in the attestation')
            }

            const proof = await _userState.genEpochKeyProof({
                nonce: epkNonce,
            })
            const data = await relayRequestData(proof, filteredReqData)
            await _provider.waitForTransaction(data.hash)
            await _userState.waitForSync()
        },
    })

    return {
        isPending,
        error,
        requestData,
    }
}
