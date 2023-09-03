import { SignupStatus } from '../contexts/User'

declare global {
    interface Window {
        ethereum: any
    }
}

const useLoginWithWallet = (
    navigate: (path: string) => void,
    hashUserId: string | null,
    handleWalletSignMessage: () => Promise<void>,
) => {
    const loginWithWallet = async () => {
        try {
            if (!hashUserId) {
                throw new Error('No hash user id')
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!window.ethereum) {
                throw new Error('請安裝MetaMask錢包')
            }
            await handleWalletSignMessage()
            navigate('/')
        } catch (error) {
            console.error(error)
        }
    }

    return loginWithWallet
}

export default useLoginWithWallet
