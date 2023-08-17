import { useCallback } from "react"
import { User } from "../contexts/User"

const useSignupWithServer = (
    hashUserId: string | null,
    SERVER: string,
    userContext: User,
    navigate: (path: string) => void
) => {
    const signupWithServer = useCallback(async () => {
        try {
            userContext.setisSignupLoading(true)
            navigate('/')
            if (!hashUserId) {
                throw new Error('Invalid user')
            }
            const response = await fetch(`${SERVER}/api/identity`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    hashUserId,
                })
            })

            if (!response.ok) {
                throw new Error('False Identity')
            }

            const data = await response.json()
            const signMessage = data.signMsg
            localStorage.setItem('signature', signMessage)
            userContext.setFromServer()
            await userContext.load()
            await userContext.signup()
            console.log('has signed up')
        } catch (error: any) {
            console.error(error)
        } finally {
            userContext.setisSignupLoading(false)
        }
    }, [SERVER, userContext, hashUserId])

    return signupWithServer
}

export default useSignupWithServer