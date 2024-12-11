import { PATHS } from '@/constants/paths'
import { AuthErrorDialog, useAuthStatus, useLogout } from '@/features/auth'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTimeoutFn } from 'react-use'
import { useAuthStore } from '../../stores/authStore'

export default function ProtectedRoute() {
    const location = useLocation()

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

    const [, , resetCheckIsLoggedIn] = useTimeoutFn(() => {
        if (isLoggingIn) {
            return
        }
        if (!isLoggedIn) {
            navigate(PATHS.LAUNCH)
        }
    }, 100)

    const [, , resetCheckIsSignedUp] = useTimeoutFn(() => {
        if (isSigningUp || isCheckingSignedUp) {
            return
        }
        if (isLoggedIn && !isSignedUp) {
            logout()
            navigate(PATHS.LAUNCH)
        }
    }, 100)

    useEffect(() => {
        if (location.pathname) {
            resetCheckIsLoggedIn()
        }
    }, [location.pathname, resetCheckIsLoggedIn])

    useEffect(() => {
        if (location.pathname) {
            resetCheckIsSignedUp()
        }
    }, [location.pathname, resetCheckIsSignedUp])

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
