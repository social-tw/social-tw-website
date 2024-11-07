import { useAuthStatus } from '@/features/auth'
import { useAuthStore } from '../../stores/authStore'

type CallbackFunction = () => void

export function useAuthCheck(errorMessage: string) {
    const { isLoggedIn } = useAuthStatus()
    const setErrorMessage = useAuthStore((state) => state.setErrorMessage)

    const checkAuth = (callback: CallbackFunction) => {
        if (!isLoggedIn) {
            setErrorMessage(errorMessage)
        } else {
            callback()
        }
    }

    return checkAuth
}
