import { UserState } from '@unirep/core'
import LOGIN_ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'
import { SignupStatus } from '../contexts/User'

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
    setErrorCode: (errorCode: keyof typeof LOGIN_ERROR_MESSAGES) => void,
    handleWalletSignMessage: (hashUserId: string) => Promise<void>,
    signup: (
        fromServer: boolean,
        userStateInstance: UserState,
        hashUserId: string,
        accessToken: string
    ) => Promise<void>,
    setIsLogin: (param: string) => void,
    createUserState: () => Promise<UserState>
) => {
    const signUpWithWallet = async () => {
        try {
            if (!hashUserId) {
                throw new Error(LOGIN_ERROR_MESSAGES.MISSING_ELEMENT.code)
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!accessToken) {
                throw new Error(LOGIN_ERROR_MESSAGES.MISSING_ELEMENT.code)
            }
            localStorage.setItem('token', accessToken)
            if (!window.ethereum) {
                throw new Error(LOGIN_ERROR_MESSAGES.NO_WALLET.code)
            }
            try {
                await handleWalletSignMessage(hashUserId)
            } catch (error: any) {
                throw new Error(LOGIN_ERROR_MESSAGES.WALLET_ISSUE.code)
            }
            const userStateInstance = await createUserState()
            setSignupStatus('pending')
            navigate('/')
            try {
                await signup(false, userStateInstance, hashUserId, accessToken)
            } catch (error: any) {
                throw new Error(LOGIN_ERROR_MESSAGES.SIGNUP_FAILED.code)
            }
            setSignupStatus('success')
            setIsLogin('success')
        } catch (error: any) {
            setSignupStatus('error')
            setErrorCode(error.message)
        }
    }

    return signUpWithWallet
}

export default useSignupWithWallet
