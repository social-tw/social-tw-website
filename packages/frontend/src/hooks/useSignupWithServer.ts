import { useCallback } from "react";

const useSignupWithServer = (
    hashUserId: string | null,
    SERVER: string,
    userContext: any,
    setStatus: any,
    setIsLoading: any,
    navigate: any
) => {
    const signupWithServer = useCallback(async () => {

        try {
            setIsLoading(true);
            setStatus('start');
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
            const signMessage = data.signMsg;
            localStorage.setItem('signature', signMessage);
            setStatus('loading');
            await userContext.setFromServer();
            await userContext.load();
            await userContext.signup();
            setStatus('success');
            console.log('has signed up');
            setTimeout(() => {
                navigate('/')
            }, 2000);
        } catch (error: any) {
            setStatus('fail');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, SERVER, userContext, hashUserId, setStatus]);

    return signupWithServer;
};

export default useSignupWithServer;