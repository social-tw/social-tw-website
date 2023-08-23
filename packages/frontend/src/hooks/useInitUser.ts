import { useEffect } from 'react'

const useInitUser = (
    userContext: any,
    hashUserId: string | null,
    setIsLoading: any
) => {
    useEffect(() => {
        const initUser = async () => {
            try {
                await userContext.load()
                console.log(userContext.hasSignup, 'init')
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }
        if (hashUserId) {
            localStorage.setItem('hashUserId', hashUserId)
        }
        initUser()
    }, [userContext, hashUserId])
}

export default useInitUser
