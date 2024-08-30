import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import { useUserState } from '@/features/core'
import {
    useIsMutating,
    useMutationState,
    useQuery,
} from '@tanstack/react-query'

export function useAuthStatus() {
    const { isPending, userState } = useUserState()

    const loginErrors = useMutationState({
        filters: {
            mutationKey: [MutationKeys.Login],
        },
        select: (mutation) => mutation.state.error,
    })

    const { isPending: isCheckingSignedUp, data: isSignedUp } = useQuery({
        queryKey: [QueryKeys.HasSignedUp, userState?.id.secret.toString()],
        queryFn: async () => {
            if (!userState) return false
            return userState.hasSignedUp()
        },
    })

    const signingUpCount = useIsMutating({
        mutationKey: [MutationKeys.Signup],
    })
    const isSigningUp = signingUpCount > 0

    const signupErrors = useMutationState({
        filters: {
            mutationKey: [MutationKeys.Signup],
        },
        select: (mutation) => mutation.state.error,
    })

    return {
        isLoggedIn: !!userState,
        isLoggingIn: isPending,
        loginErrors,
        isCheckingSignedUp,
        isSignedUp,
        isSigningUp,
        signupErrors,
    }
}
