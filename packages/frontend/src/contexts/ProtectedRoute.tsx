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

    if (signupStatus === 'pending' || signupStatus === 'success') {
        return children
    } else if (isLogin !== 'success') {
        return <Navigate to={PATHS.WELCOME} />
    } else {
        return children
    }
}
