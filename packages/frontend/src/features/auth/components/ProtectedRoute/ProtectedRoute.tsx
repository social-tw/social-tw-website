import { PATHS } from '@/constants/paths'
import { useAuthStatus, useLogout } from '@/features/auth'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type ProtectedRouterProps = {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouterProps) {
    const navigate = useNavigate()

    const {
        isLoggedIn,
        isLoggingIn,
        isSignedUp,
        isSigningUp,
        isCheckingSignedUp,
    } = useAuthStatus()

    const { logout } = useLogout()

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

    if (!isLoggedIn) {
        return null
    }

    return <>{children}</>
}
