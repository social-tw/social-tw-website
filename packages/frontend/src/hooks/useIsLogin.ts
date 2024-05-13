import useUserState from './useUserState'

export default function useIsLogin() {
    const { isPending, userState } = useUserState()

    return {
        isLoggedIn: !!userState,
        isLoggingIn: isPending,
    }
}
