import { useEffect } from 'react'
import { SignupStatus } from '../contexts/User'

const useInitUser = (
    signupStatus: SignupStatus,
    load: () => Promise<void>,
    logout: () => void
) => {
    useEffect(() => {
        const initUser = async () => {
            try {
                if (signupStatus === 'pending') {
                    return
                }
                await load()
            } catch (error: any) {
                logout()
            }
        }

        initUser()
    }, [signupStatus])
}

export default useInitUser
