import { PATHS } from '@/constants/paths'
import { AuthErrorDialog, useAuthStatus, useLogout } from '@/features/auth'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { Outlet, useNavigate } from 'react-router-dom'

export default function ProtectedRoute() {
    const navigate = useNavigate()

    const {
        isLoggedIn,
        isLoggingIn,
        isSignedUp,
        isSigningUp,
        isCheckingSignedUp,
    } = useAuthStatus()

    const { logout } = useLogout()
    const { errorMessage, setErrorMessage } = useAuthStore()
    const isFirstRender = useIsFirstRender()

    useEffect(() => {
        if (isFirstRender || isLoggingIn) {
            return
        }
        if (!isLoggedIn) {
            navigate(PATHS.LAUNCH)
        }
    }, [isFirstRender, isLoggedIn, isLoggingIn, navigate])

    useEffect(() => {
        if (isFirstRender || isSigningUp || isCheckingSignedUp) {
            return
        }
        if (isLoggedIn && !isSignedUp) {
            logout()
            navigate(PATHS.LAUNCH)
        }
    }, [
        isCheckingSignedUp,
        isFirstRender,
        isLoggedIn,
        isSignedUp,
        isSigningUp,
        logout,
        navigate,
    ])

    return (
        <>
            <Outlet />
            {errorMessage && (
                <AuthErrorDialog
                    isOpen={!!errorMessage}
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                />
            )}
        </>
    )
}
