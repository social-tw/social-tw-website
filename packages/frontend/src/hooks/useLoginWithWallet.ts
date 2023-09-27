import { UserState } from '@unirep/core'
import ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'

const useLoginWithWallet = (
    accessToken: string | null,
    hashUserId: string | null,
    navigate: (path: string) => void,
    setErrorCode: (errorCode: keyof typeof ERROR_MESSAGES) => void,
    handleWalletSignMessage: (hashUserId: string) => Promise<void>,
    setIsLogin: (param: string) => void,
    createUserState: () => Promise<UserState | undefined>
) => {
    const loginWithWallet = async () => {
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
