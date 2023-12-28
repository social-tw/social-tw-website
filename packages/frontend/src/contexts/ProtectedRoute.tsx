import React from 'react'
import { Navigate } from 'react-router-dom'
import { PATHS } from '../constants/paths'
import { useUser } from './User'

type ProtectedRouterProps = {
    children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouterProps> = ({
    children,
}) => {
    const { isLogin, signupStatus } = useUser()

    if (!isLogin || signupStatus === 'error') {
        return <Navigate to={PATHS.WELCOME} />
    }

    return children
}
