import {
    useIsMutating,
    useMutationState,
    useQuery,
} from '@tanstack/react-query'
import { useUserState } from '@/features/core'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'

export function useAuthStatus() {
    const { isPending, userState } = useUserState()

    const loginErrors = useMutationState({
        filters: {
            mutationKey: [MutationKeys.Login],
        },
        select: (mutation) => mutation.state.error,
    })

    const { isPending: isCheckingSignedUp, data: isSignedUp } = useQuery({
        queryKey: [QueryKeys.HasSignedUp, userState?.id?.toString()],
        queryFn: async () => {
            if (!userState) return false
            return userState.hasSignedUp()
        },
    })

    const isSigningUp = useIsMutating({
        mutationKey: [MutationKeys.Signup],
    })

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
