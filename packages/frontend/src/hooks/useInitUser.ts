import { useEffect } from 'react'
import { SignupStatus } from '@/contexts/User'

const useInitUser = (
    isLogin: boolean,
    signupStatus: SignupStatus,
    load: () => Promise<void>,
    logout: () => void,
) => {
    useEffect(() => {
        const initUser = async () => {
            if (!isLogin) return
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
    }, [])
}

export default useInitUser
