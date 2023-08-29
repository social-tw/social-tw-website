import { SignupStatus } from '../contexts/User'

const useSignupWithServer = (
    navigate: (path: string) => void,
    setSignupStatus: (param: SignupStatus) => void,
    getServerSignMessage: () => Promise<void>,
    signup: () => Promise<void>,
    setIsLogin: (param: boolean) => void
) => {
    const signupWithServer = async () => {
        try {
            await getServerSignMessage()
            setSignupStatus('pending')
            navigate('/')
            await signup()
            console.log('has signed up')
            setSignupStatus('success')
            setIsLogin(true)
        } catch (error: any) {
            setSignupStatus('error')
            console.error(error)
        }
    }

    return signupWithServer
}

export default useSignupWithServer
