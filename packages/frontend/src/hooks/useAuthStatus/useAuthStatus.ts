import {
    useIsMutating,
    useMutationState,
    useQuery,
} from '@tanstack/react-query'
import { useUserState } from '../useUserState/useUserState'
import { MutationKeys, QueryKeys } from '@/constants/queryKeys'

export function useAuthStatus() {
    const { isPending, userState } = useUserState()

    const loginErrors = useMutationState({
        filters: {
            mutationKey: [MutationKeys.Login],
        },
        select: (mutation) => mutation.state.error,
    })

    const { data: isSignedUp } = useQuery({
        queryKey: [QueryKeys.HasSignedUp],
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
        isSignedUp,
        isSigningUp,
        signupErrors,
    }
}
