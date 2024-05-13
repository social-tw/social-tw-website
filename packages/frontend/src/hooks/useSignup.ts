import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { relaySignUp } from '@/utils/api'
import useUserState, { getGuaranteedUserState } from './useUserState'
import useWeb3Provider, { getGuaranteedWeb3Provider } from './useWeb3Provider'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { SignupFailedError } from '@/utils/errors'

export default function useSignup() {
    const queryClient = useQueryClient()

    const provider = useWeb3Provider()

    const { userState } = useUserState()

    const { data: hasSignedUp } = useQuery({
        queryKey: [QueryKeys.HasSignedUp],
        queryFn: async () => {
            if (!userState) return false
            return userState.hasSignedUp()
        },
    })

    const {
        isPending,
        error,
        mutateAsync: signup,
    } = useMutation({
        mutationKey: [MutationKeys.Signup],
        mutationFn: async ({
            hashUserId,
            accessToken,
            fromServer,
        }: {
            hashUserId: string
            accessToken: string
            fromServer: boolean
        }) => {
            try {
                if (hasSignedUp) return

                const _provider = getGuaranteedWeb3Provider(provider)
                const _userState = getGuaranteedUserState(userState)

                const proof = await _userState.genUserSignUpProof()

                const data = await relaySignUp(
                    proof,
                    hashUserId,
                    accessToken,
                    fromServer,
                )

                await _provider.waitForTransaction(data.hash)
                await _userState.waitForSync()

                return data
            } catch {
                throw new SignupFailedError()
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.HasSignedUp],
            })
        },
    })

    return {
        isPending,
        error,
        hasSignedUp,
        signup,
    }
}
