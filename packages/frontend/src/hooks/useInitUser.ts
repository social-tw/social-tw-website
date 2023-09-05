import { useEffect } from 'react'
import { SignupStatus } from '../contexts/User'

const useInitUser = (
    load: () => Promise<void>, 
    signupStatus: SignupStatus
) => {
    useEffect(() => {
        const initUser = async () => {
            try {
                if (signupStatus === 'pending') throw new Error('signup is loading')
                console.log('init user')
                await load()
            } catch (error) {
                console.log(error)
            }
        }

        initUser()
    }, [signupStatus])
}

export default useInitUser
