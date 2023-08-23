import { useContext, useEffect } from 'react'
import { UserContext } from '../contexts/User'

// TODO: redirect to home page
const useAutoNavigation = (
    hashUserId: string | null,
    status: string | null,
    navigate: any,
    userContext: any,
    isLoading: boolean
) => {
    useEffect(() => {
        if (!isLoading) {
            console.log(userContext.hasSignup, 'nav')
            if (!userContext.hasSignedUp && hashUserId) {
                navigate(`/login?code=${hashUserId}&status=${status}`)
            } else if (!userContext.hasSignedUp && !hashUserId && !status) {
                navigate('/login')
            } else {
                navigate('/')
            }
        }
    }, [userContext.hasSignedUp, navigate, hashUserId, status, isLoading])
}

export default useAutoNavigation
