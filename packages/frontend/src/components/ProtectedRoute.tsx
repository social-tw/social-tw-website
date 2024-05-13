import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useIsLogin from '@/hooks/useIsLogin'
import { PATHS } from '@/constants/paths'
import { useIsFirstRender } from '@uidotdev/usehooks'

type ProtectedRouterProps = {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouterProps) {
    const isFirstRender = useIsFirstRender()

    const navigate = useNavigate()

    const { isLoggedIn, isLoggingIn } = useIsLogin()

    useEffect(() => {
        if (isFirstRender) {
            return
        }
        if (!isLoggedIn) {
            navigate(PATHS.WELCOME)
        }
    }, [isLoggedIn])

    if (isLoggingIn) {
        return null
    }

    return children
}
