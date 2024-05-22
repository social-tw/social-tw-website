import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useAuthStatus } from '@/features/auth/hooks/useAuthStatus/useAuthStatus'
import { PATHS } from '@/constants/paths'
// import { useLogout } from '@/features/auth/hooks/useLogout/useLogout'

type ProtectedRouterProps = {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouterProps) {
    const navigate = useNavigate()

    const {
        isLoggedIn,
        isLoggingIn,
        // isSignedUp,
        // isSigningUp
    } = useAuthStatus()

    // const { logout } = useLogout()

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

    // XXX: user should logout if has not signed up
    // useEffect(() => {
    //     if (isLoggedIn && !isSigningUp && !isSignedUp) {
    //         logout()
    //         navigate(PATHS.WELCOME)
    //     }
    // }, [isLoggedIn, isSignedUp, isSigningUp, logout, navigate])

    if (isLoggingIn) {
        return null
    }

    return <>{children}</>
}
