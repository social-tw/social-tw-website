import { useContext, useEffect } from "react";
import { User } from "../contexts/User";

// TODO: redirect to home page
const useAutoNavigation = (
    hashUserId: string | null, 
    status: string | null, 
    navigate: (path: string) => void, 
    userContext: User,
    isLoading: boolean
) => {
    useEffect(() => {
        if (!isLoading) {
            if (!userContext.hasSignedUp && hashUserId) {
                navigate(`/login?code=${hashUserId}&status=${status}`)
            } else if (!userContext.hasSignedUp && !hashUserId && !status && !userContext.isSignupLoading) {
                navigate('/login')
            } else {
                return
            }
        }
    }, [userContext.hasSignedUp, navigate, hashUserId, status, isLoading]);
};

export default useAutoNavigation;