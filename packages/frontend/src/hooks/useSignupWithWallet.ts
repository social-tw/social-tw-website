import { SignupStatus } from '../contexts/User'
import { UserState } from '@unirep/core'

declare global {
    interface Window {
        ethereum: any
    }
}

const useSignupWithWallet = (
    accessToken: string | null,
    hashUserId: string | null,
    navigate: (path: string) => void,
    setSignupStatus: (param: SignupStatus) => void,
    handleWalletSignMessage: (hashUserId: string) => Promise<void>,
    signup: (
        fromServer: boolean,
        userStateInstance: UserState,
        hashUserId: string,
        accessToken: string
    ) => Promise<void>,
    setIsLogin: (param: boolean) => void,
    createUserState: () => Promise<UserState | undefined>
) => {
    const signUpWithWallet = async () => {
        try {
            if (!hashUserId) {
                throw new Error('No hash user id')
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!accessToken) {
                throw new Error('No access token')
            }
            localStorage.setItem('token', accessToken)
            if (!window.ethereum) {
                throw new Error('請安裝MetaMask錢包')
            }
            await handleWalletSignMessage(hashUserId)
            const userStateInstance = await createUserState()
            if (!userStateInstance) throw new Error('No user state instance')
            setSignupStatus('pending')
            navigate('/')
            await signup(false, userStateInstance, hashUserId, accessToken)
            console.log('has signed up')
            setSignupStatus('success')
            localStorage.setItem('loginStatus', 'success')
            setIsLogin(true)
        } catch (error) {
            setSignupStatus('error')
            console.error(error)
        }
    }

    return signUpWithWallet
}

export default useSignupWithWallet
