import { useCallback, useContext } from "react";
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum: any
    }
}

const useSignupWithWallet = (
    hashUserId: string | null, 
    userContext: any,
    setStatus: any, 
    setIsLoading: any,
    navigate: any
) => {
    const signUpWithWallet = useCallback(async () => {

        try {
            setIsLoading(true);
            setStatus('start');
            if (!hashUserId) {
                throw new Error('Invalid user')
            };
            if (!window.ethereum) {
                throw new Error('請安裝MetaMask錢包')
            };
            console.log('waiting sign up...')
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];

            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [
                    ethers.utils.hexlify(
                        ethers.utils.toUtf8Bytes(hashUserId)
                    ),
                    account,
                ],
            });

            localStorage.setItem('signature', signature);
            setStatus('loading');
            await userContext.load();
            await userContext.signup();
            console.log('has signed up');
            setStatus('success');
            setTimeout(() => {
                navigate('/')
            }, 2000);
        }   catch (error) {
            setStatus('fail');
            console.error(error);
        }   finally {
            setIsLoading(false);
        }
    }, [hashUserId, setIsLoading, useContext, setStatus])

    return signUpWithWallet
};

export default useSignupWithWallet