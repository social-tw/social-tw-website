import { SignupStatus } from '../contexts/User'
import { UserState } from '@unirep/core'
import ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'

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
    setErrorCode: (errorCode: keyof typeof ERROR_MESSAGES) => void,
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
                throw new Error('MISSING_ELEMENT')
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!accessToken) {
                throw new Error('MISSING_ELEMENT')
            }
            localStorage.setItem('token', accessToken)
            if (!window.ethereum) {
                throw new Error('NO_WALLET')
            }
            try { 
                await handleWalletSignMessage(hashUserId)
            } catch (error: any) {
                throw new Error('WALLET_ISSUE')
            }
            const userStateInstance = await createUserState()
            if (!userStateInstance) throw new Error('MISSING_ELEMENT')
            setSignupStatus('pending')
            navigate('/')
            try {
                await signup(false, userStateInstance, hashUserId, accessToken)
            } catch (error: any) {
                throw new Error('SIGNUP_FAILED')
            }
            setSignupStatus('success')
            localStorage.setItem('loginStatus', 'success')
            setIsLogin(true)
        } catch (error: any) {
            setSignupStatus('error')
            setErrorCode(error.message)
        }
    }

    return signUpWithWallet
}

export default useSignupWithWallet
