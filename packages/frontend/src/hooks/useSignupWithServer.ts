import { SignupStatus } from '../contexts/User'
import { UserState } from '@unirep/core'

const useSignupWithServer = (
    hashUserId: string | null,
    navigate: (path: string) => void,
    setSignupStatus: (param: SignupStatus) => void,
    handleServerSignMessage: (hashUserId: string) => Promise<void>,
    signup: (
        fromServer: boolean,
        userStateInstance: UserState,
        hashUserId: string
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
            await handleServerSignMessage(hashUserId)
            const userStateInstance = await createUserState()
            if (!userStateInstance) throw new Error('No user state instance')
            setSignupStatus('pending')
            navigate('/')
            await signup(false, userStateInstance, hashUserId)
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
