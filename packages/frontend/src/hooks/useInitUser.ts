import { useEffect } from "react";
import { User } from "../contexts/User"; 

const useInitUser = (
    userContext: User, 
    hashUserId: string | null, 
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
    useEffect(() => {
        const initUser = async () => {
            try {
                await userContext.load()
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        };
        if (hashUserId) {
            localStorage.setItem('hashUserId', hashUserId)
        };
        initUser();
    }, [userContext, hashUserId]);
};

export default useInitUser;
