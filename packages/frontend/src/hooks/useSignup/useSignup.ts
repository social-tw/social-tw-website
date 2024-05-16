import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { relaySignUp } from '@/utils/api'
import { useUserState } from '../useUserState/useUserState'
import { useWeb3Provider } from '../useWeb3Provider/useWeb3Provider'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { SignupFailedError } from '@/utils/errors'

export function useSignup() {
    const queryClient = useQueryClient()

    const { getGuaranteedProvider } = useWeb3Provider()

    const { userState, getGuaranteedUserState } = useUserState()

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

                const provider = getGuaranteedProvider()
                const userState = await getGuaranteedUserState()

                const proof = await userState.genUserSignUpProof()

                const data = await relaySignUp(
                    proof,
                    hashUserId,
                    accessToken,
                    fromServer,
                )

                await provider.waitForTransaction(data.hash)
                await userState.waitForSync()

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
