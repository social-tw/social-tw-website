import { useEffect } from 'react'

const useInitUser = (load: () => Promise<void>, logout: () => void) => {
    useEffect(() => {
        const initUser = async () => {
            try {
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
