import { UserState } from '@unirep/core'
import LOGIN_ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'

const useLoginWithServer = (
    accessToken: string | null,
    hashUserId: string | null,
    signMsg: string | null,
    navigate: (path: string) => void,
    setErrorCode: (errorCode: keyof typeof LOGIN_ERROR_MESSAGES) => void,
    setIsLogin: (param: any) => void,
    createUserState: () => Promise<UserState>
) => {
    const loginWithServer = async () => {
        try {
            if (!hashUserId) {
                throw new Error(LOGIN_ERROR_MESSAGES.MISSING_ELEMENT.code)
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!signMsg) {
                throw new Error(LOGIN_ERROR_MESSAGES.MISSING_ELEMENT.code)
            }
            localStorage.setItem('signature', signMsg)
            if (!accessToken) {
                throw new Error(LOGIN_ERROR_MESSAGES.MISSING_ELEMENT.code)
            }
            localStorage.setItem('token', accessToken)
            await createUserState()
            setIsLogin('success')
            localStorage.removeItem('showLogin')
            navigate('/')
        } catch (error: any) {
            setErrorCode(error.message)
        }
    }
    return loginWithServer
}

export default useLoginWithServer
