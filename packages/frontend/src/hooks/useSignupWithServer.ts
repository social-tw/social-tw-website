import { SignupStatus } from '../contexts/User'
import { UserState } from '@unirep/core'

const useSignupWithServer = (
    accessToken: string | null,
    hashUserId: string | null,
    signMsg: string | null,
    navigate: (path: string) => void,
    setSignupStatus: (param: SignupStatus) => void,
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
                throw new Error('No hash user id')
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!signMsg) {
                throw new Error('No sign message')
            }
            localStorage.setItem('signature', signMsg)
            if (!accessToken) {
                throw new Error('No access token')
            }
            localStorage.setItem('token', accessToken)
            const userStateInstance = await createUserState()
            if (!userStateInstance) throw new Error('No user state instance')
            setSignupStatus('pending')
            navigate('/')
            await signup(true, userStateInstance, hashUserId, accessToken)
            console.log('has signed up')
            setSignupStatus('success')
            localStorage.setItem('loginStatus', 'success')
            setIsLogin(true)
        } catch (error: any) {
            setSignupStatus('error')
            console.error(error)
        }
    }

    return signupWithServer
}

export default useSignupWithServer
