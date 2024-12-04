import React from 'react'
import { useAuthStore } from '../stores/authStore'
import AuthErrorDialog from '../components/AuthErrorDialog/AuthErrorDialog'

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { errorMessage, setErrorMessage } = useAuthStore()

    return (
        <>
            {children}
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

export default AuthProvider
