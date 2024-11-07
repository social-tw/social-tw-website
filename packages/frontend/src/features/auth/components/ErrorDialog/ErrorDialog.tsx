import AuthErrorDialog from '@/features/auth/components/AuthErrorDialog/AuthErrorDialog'
import { useAuthStatus } from '@/features/auth/hooks/useAuthStatus/useAuthStatus'
import { useNavigate } from 'react-router-dom'

export default function ErrorDialog() {
    const { signupErrors } = useAuthStatus()
    const isError = signupErrors.some((error) => !!error)
    const navigate = useNavigate()

    const handleClose = () => {
        navigate('/welcome')
    }

    return (
        <AuthErrorDialog
            isOpen={isError}
            message={signupErrors[0]?.message}
            onClose={handleClose}
        />
    )
}
