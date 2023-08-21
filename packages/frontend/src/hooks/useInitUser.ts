import { useEffect } from 'react'

const useInitUser = (
    load: () => Promise<void>, 
    hashUserId: string | null, 
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
    useEffect(() => {
        const initUser = async () => {
            try {
                await load()
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
    }, [hashUserId])
}

export default useInitUser
