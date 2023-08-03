import { useCallback } from "react";

const useSignupWithServer = (
    hashUserId: string | null, 
    SERVER: string, 
    userContext: any, 
    setIsLoading: any
) => {
    const signupWithServer = useCallback(async() => {

        try {
            setIsLoading(true);
            if (!hashUserId) {
                throw new Error('Invalid user')
            };
            const response = await fetch(`${SERVER}/api/identity`, {
                method: 'POST',
                body: JSON.stringify({
                    hashUserId,
                })
            });
        
            const data = await response.json();
            console.log(data)
        
            const signMessage = data.signMsg;
            console.log(signMessage)
    
            localStorage.setItem('signature', signMessage);

            await userContext.setFromServer();
    
            await userContext.load();

            await userContext.signup();
        }   catch (error: any) {
            console.error(error);
        }   finally {
            console.log('has signed up')
            setIsLoading(false);
        }
    }, [setIsLoading, SERVER, userContext, hashUserId]);

    return signupWithServer;
};

export default useSignupWithServer;