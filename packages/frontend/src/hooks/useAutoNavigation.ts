import { useEffect } from 'react'

// TODO: No need now
const useAutoNavigation = (
    hashUserId: string | null,
    status: string | null,
    navigate: (path: string) => void,
    hasSignedUp: boolean,
    isSignupLoading: boolean,
    isLoading: boolean
) => {
    useEffect(() => {
        if (!isLoading) {
            if (!hasSignedUp && hashUserId) {
                navigate(`/login?code=${hashUserId}&status=${status}`)
            } else if (
                !hasSignedUp &&
                !hashUserId &&
                !status &&
                !isSignupLoading
            ) {
                navigate('/login')
            } else {
                return
            }
        }
    }, [hasSignedUp, hashUserId, status, isSignupLoading, isLoading])
}

export default useAutoNavigation
