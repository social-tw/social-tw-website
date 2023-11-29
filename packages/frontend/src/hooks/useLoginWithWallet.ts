import { UserState } from '@unirep/core'
import LOGIN_ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'

const useLoginWithWallet = (
    accessToken: string | null,
    hashUserId: string | null,
    navigate: (path: string) => void,
    setErrorCode: (errorCode: keyof typeof LOGIN_ERROR_MESSAGES) => void,
    handleWalletSignMessage: (hashUserId: string) => Promise<void>,
    setIsLogin: (param: string) => void,
    createUserState: () => Promise<UserState>
) => {
    const loginWithWallet = async () => {
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
            await createUserState()
            localStorage.removeItem('showLogin')
            setIsLogin('success')
            navigate('/')
        } catch (error: any) {
            setErrorCode(error.message)
        }
    }

    return loginWithWallet
}

export default useLoginWithWallet
