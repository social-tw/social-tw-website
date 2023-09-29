import { UserState } from '@unirep/core'

const useLoginWithServer = (
    accessToken: string | null,
    hashUserId: string | null,
    signMsg: string | null,
    navigate: (path: string) => void,
    createUserState: () => Promise<UserState | undefined>
) => {
    const loginWithServer = async () => {
        try {
            if (!hashUserId) {
                throw new Error('No hash user id')
            }
            localStorage.setItem('hashUserId', hashUserId)
            if (!signMsg) {
                throw new Error('No signature')
            }
            localStorage.setItem('signature', signMsg)
            if (!accessToken) {
                throw new Error('No access token')
            }
            localStorage.setItem('token', accessToken)
            await createUserState()
            localStorage.setItem('loginStatus', 'success')
            localStorage.removeItem('showLogin')
            navigate('/')
        } catch (error) {
            console.error(error)
        }
    }
    return loginWithServer
}

export default useLoginWithServer
