import { SignupStatus } from '../contexts/User'
import { UserState } from '@unirep/core'
import ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage'

const useSignupWithServer = (
    accessToken: string | null,
    hashUserId: string | null,
    signMsg: string | null,
    navigate: (path: string) => void,
    setSignupStatus: (param: SignupStatus) => void,
    setErrorCode: (errorCode: keyof typeof ERROR_MESSAGES) => void,
    signup: (
        fromServer: boolean,
        userStateInstance: UserState,
        hashUserId: string,
        accessToken: string
    ) => Promise<void>,
    setIsLogin: (param: boolean) => void,
    createUserState: () => Promise<UserState | undefined>
) => {
    const signupWithServer = async () => {
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
            const userStateInstance = await createUserState()
            if (!userStateInstance) throw new Error('MISSING_ELEMENT')
            setSignupStatus('pending')
            navigate('/')
            try {
                await signup(true, userStateInstance, hashUserId, accessToken)
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

    return signupWithServer
}

export default useSignupWithServer
