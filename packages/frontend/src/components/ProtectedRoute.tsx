import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { useAuthStatus } from '@/hooks/useAuthStatus/useAuthStatus'
import { PATHS } from '@/constants/paths'

type ProtectedRouterProps = {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouterProps) {
    const navigate = useNavigate()
    
    const { isLoggedIn, isLoggingIn } = useAuthStatus()
    
    const isFirstRender = useIsFirstRender()

    useEffect(() => {
        if (isFirstRender || isLoggingIn) {
            return
        }
        if (!isLoggedIn) {
            navigate(PATHS.WELCOME)
        }
    }, [isFirstRender, isLoggedIn, isLoggingIn, navigate])

    if (isLoggingIn) {
        return null
    }

    return <>{children}</>
}
