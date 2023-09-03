import { SignupStatus } from '../contexts/User'

const useSignupWithServer = (
    navigate: (path: string) => void,
    setSignupStatus: (param: SignupStatus) => void,
    handleServerSignMessage: () => Promise<void>,
    signup: (fromServer: boolean) => Promise<void>,
    setIsLogin: (param: boolean) => void,
) => {
    const signupWithServer = async () => {
        try {
            await handleServerSignMessage()
            setSignupStatus('pending')
            navigate('/')
            await signup(true)
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
