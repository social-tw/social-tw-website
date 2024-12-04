import { useAuthStatus } from '@/features/auth'
import { useAuthStore } from '../../stores/authStore'

export function useAuthCheck(errorMessage: string) {
    const { isLoggedIn } = useAuthStatus()
    const setErrorMessage = useAuthStore((state) => state.setErrorMessage)

    const checkAuth = async (): Promise<void> => {
        if (!isLoggedIn) {
            setErrorMessage(errorMessage)
            throw new Error('User is not logged in')
        }
    }

    return checkAuth
}
