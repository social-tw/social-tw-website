import { useCallback } from "react";

const useSignupWithServer = (
    hashUserId: string | null,
    SERVER: string,
    userContext: any,
    setIsLoading: any
) => {
    const signupWithServer = useCallback(async () => {

        try {
            setIsLoading(true);
            if (!hashUserId) {
                throw new Error('Invalid user')
            };
            const response = await fetch(`${SERVER}/api/identity`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    hashUserId,
                })
            });

            if (!response.ok) {
                throw new Error('False Identity')
            };

            const data = await response.json();
            console.log(data);
            

            const signMessage = data.signMsg;

            localStorage.setItem('signature', signMessage);

            await userContext.setFromServer();

            await userContext.load();

            await userContext.signup();
            console.log('has signed up');
        } catch (error: any) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, SERVER, userContext, hashUserId]);

    return signupWithServer;
};

export default useSignupWithServer;