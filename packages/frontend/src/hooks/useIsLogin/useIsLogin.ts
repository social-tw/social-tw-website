import { useUserState } from '../useUserState/useUserState'

export function useIsLogin() {
    const { isPending, userState } = useUserState()

    return {
        isLoggedIn: !!userState,
        isLoggingIn: isPending,
    }
}
