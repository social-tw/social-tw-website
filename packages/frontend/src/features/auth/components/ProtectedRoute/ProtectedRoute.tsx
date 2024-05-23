import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useAuthStatus, useLogout } from '@/features/auth'
import { PATHS } from '@/constants/paths'

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
            console.log('not logged in')
            navigate(PATHS.WELCOME)
        }
    }, [isFirstRender, isLoggedIn, isLoggingIn, navigate])

    useEffect(() => {
        if (isFirstRender || isSigningUp || isCheckingSignedUp) {
            return
        }
        if (isLoggedIn && !isSignedUp) {
            logout()
            navigate(PATHS.WELCOME)
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

    if (isLoggingIn) {
        return null
    }

    return <>{children}</>
}
