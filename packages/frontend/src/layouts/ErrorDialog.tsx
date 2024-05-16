import AuthErrorDialog from "@/components/login/AuthErrorDialog";
import { useAuthStatus } from "@/hooks/useAuthStatus/useAuthStatus";

export default function ErrorDialog() {
    const { signupErrors } = useAuthStatus()
    const isError = signupErrors.some((error) => !!error)

    return (
        <AuthErrorDialog
            isOpen={isError}
            message={signupErrors[0]?.message}
        />
    )
}