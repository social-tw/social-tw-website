import { useEffect } from 'react'
import { SignupStatus } from '../contexts/User'

const useInitUser = (
    isLogin: boolean,
    signupStatus: SignupStatus,
    load: () => Promise<void>,
    logout: () => void,
) => {
    useEffect(() => {
        if (!isLogin) return
        const initUser = async () => {
            try {
                if (signupStatus === 'pending') {
                    return
                }
                await load()
            } catch (error: any) {
                if (!error.message.includes('user is not signed up')) {
                    logout()
                }
            }
        }

        initUser()
    }, [signupStatus, isLogin])
}

export default useInitUser
