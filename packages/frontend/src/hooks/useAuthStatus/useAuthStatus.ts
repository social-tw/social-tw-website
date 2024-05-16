import { useIsMutating, useMutationState } from "@tanstack/react-query"
import { useUserState } from "../useUserState/useUserState"
import { MutationKeys } from '@/constants/queryKeys';

export function useAuthStatus() {
    const { isPending, userState } = useUserState()

    const loginErrors = useMutationState({
        filters: {
            mutationKey: [MutationKeys.Login]
        },
        select: (mutation) => mutation.state.error
    })

    const isSigningUp = useIsMutating({
        mutationKey: [MutationKeys.Signup],
    })

    const signupErrors = useMutationState({
        filters: {
            mutationKey: [MutationKeys.Signup]
        },
        select: (mutation) => mutation.state.error
    })

    return {
        isLoggedIn: !!userState,
        isLoggingIn: isPending,
        loginErrors,
        isSigningUp,
        signupErrors,
    }
}