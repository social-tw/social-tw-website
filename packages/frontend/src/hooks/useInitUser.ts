import { useEffect } from 'react'

const useInitUser = (load: () => Promise<void>, hashUserId: string | null) => {
    useEffect(() => {
        const initUser = async () => {
            try {
                console.log('initUser')
                await load()
            } catch (error) {
                console.log(error)
            }
        }

        if (hashUserId) {
            localStorage.setItem('hashUserId', hashUserId)
        }

        initUser()
    }, [hashUserId])
}

export default useInitUser
