import { UserState } from '@unirep/core'
import ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'

const useLoginWithServer = (
    accessToken: string | null,
    hashUserId: string | null,
    signMsg: string | null,
    navigate: (path: string) => void,
    setErrorCode: (errorCode: keyof typeof ERROR_MESSAGES) => void,
    createUserState: () => Promise<UserState | undefined>
) => {
    const loginWithServer = async () => {
        try {
            if (!hashUserId) {
                throw new Error('MISSING_ELEMENT')
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!signMsg) {
                throw new Error('MISSING_ELEMENT')
            }
            localStorage.setItem('signature', signMsg)
            if (!accessToken) {
                throw new Error('MISSING_ELEMENT')
            }
            localStorage.setItem('token', accessToken)
            await createUserState()
            localStorage.setItem('loginStatus', 'success')
            localStorage.removeItem('showLogin')
            navigate('/')
        } catch (error: any) {
            setErrorCode(error.message)
        }
    }
    return loginWithServer
}

export default useLoginWithServer
