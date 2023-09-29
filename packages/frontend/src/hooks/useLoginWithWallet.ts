import { UserState } from '@unirep/core'

declare global {
    interface Window {
        ethereum: any
    }
}

const useLoginWithWallet = (
    accessToken: string | null,
    hashUserId: string | null,
    navigate: (path: string) => void,
    handleWalletSignMessage: (hashUserId: string) => Promise<void>,
    createUserState: () => Promise<UserState | undefined>
) => {
    const loginWithWallet = async () => {
        try {
            if (!hashUserId) {
                throw new Error('No hash user id')
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!accessToken) {
                throw new Error('No hash user id')
            }
            localStorage.setItem('token', accessToken)
            if (!window.ethereum) {
                throw new Error('請安裝MetaMask錢包')
            }
            await handleWalletSignMessage(hashUserId)
            await createUserState()
            localStorage.removeItem('showLogin')
            localStorage.setItem('loginStatus', 'success')
            navigate('/')
        } catch (error) {
            console.error(error)
        }
    }

    return loginWithWallet
}

export default useLoginWithWallet
