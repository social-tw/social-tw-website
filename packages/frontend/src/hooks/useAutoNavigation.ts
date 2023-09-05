import { useEffect } from 'react'
import { SignupStatus } from '../contexts/User'

const useAutoNavigation = (
    signupStatus: SignupStatus,
    setIsLogin: (param: boolean) => void,
    navigate: (path: string) => void
) => {
    useEffect(() => {
        if (signupStatus === 'pending' || signupStatus === 'success') return
        const loginStatus = localStorage.getItem('loginStatus') ?? ''
        if (loginStatus === 'success') {
            setIsLogin(true)
        } else {
            navigate('/login')
        }
    }, [])
}

export default useAutoNavigation
