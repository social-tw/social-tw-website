import { Navigate } from 'react-router-dom';
import { useUser } from './User';
import React from 'react';

type ProtectedRouterProps = {
    children: React.ReactNode;
};

export const ProtectedRoute: React.FC<ProtectedRouterProps> = ({
    children,
}) => {
    const { isLogin, signupStatus } = useUser();

    if (signupStatus === 'pending' || signupStatus === 'success') {
        return children;
    } else if (isLogin !== 'success') {
        return <Navigate to="/login" />;
    } else {
        return children;
    }
};
