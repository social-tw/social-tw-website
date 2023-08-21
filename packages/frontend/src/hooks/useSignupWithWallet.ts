declare global {
    interface Window {
        ethereum: any
    }
}

const useSignupWithWallet = (
    navigate: (path: string) => void,
    setIsSignupLoading: (loading: boolean) => void,
    handleWalletSignMessage: () => Promise<void>,
    load: () => Promise<void>,
    signup: () => Promise<void>,
) => {
    const signUpWithWallet = async () => {
        try {
            setIsSignupLoading(true)
            if (!window.ethereum) {
                throw new Error('請安裝MetaMask錢包')
            }
            navigate('/')
            handleWalletSignMessage()
            await load()
            await signup()
            console.log('has signed up')
        }   catch (error) {
            console.error(error)
        }   finally {
            setIsSignupLoading(false)
        }
    }

    return signUpWithWallet
}

export default useSignupWithWallet