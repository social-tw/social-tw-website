import AuthErrorDialog from '@/features/auth/components/AuthErrorDialog/AuthErrorDialog'
import { useAuthStatus } from '@/features/auth/hooks/useAuthStatus/useAuthStatus'

export default function ErrorDialog() {
    const { signupErrors } = useAuthStatus()
    const isError = signupErrors.some((error) => !!error)

    return (
        <AuthErrorDialog isOpen={isError} message={signupErrors[0]?.message} />
    )
}
